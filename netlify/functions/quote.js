const Airtable = require('airtable');

function parseDataUrl(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;

  const [header, encoded] = dataUrl.split(',');
  if (!header || !encoded) return null;

  const mimeType = header.match(/^data:(.*?);base64$/)?.[1] || 'application/octet-stream';

  return {
    mimeType,
    base64: encoded
  };
}

async function sendNotificationEmail(payload) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!resendApiKey || !notifyEmail) {
    return;
  }

  const fromAddress = process.env.EMAIL_FROM || 'Prairie Auto Care <noreply@yourdomain.com>';
  const customerName = payload.name || 'New customer';
  const phoneText = payload.phone ? `<p><strong>Phone:</strong> ${payload.phone}</p>` : '';
  const photoText = payload.vehicle_photo_name
    ? `<p><strong>Vehicle Photo:</strong> ${payload.vehicle_photo_name}</p>`
    : '<p><strong>Vehicle Photo:</strong> Not provided</p>';

  const htmlBody = `
    <h2>New quote request</h2>
    <p><strong>Name:</strong> ${customerName}</p>
    <p><strong>Email:</strong> ${payload.email || 'Not provided'}</p>
    ${phoneText}
    <p><strong>Service Area:</strong> ${payload.service_area || 'Not provided'}</p>
    <p><strong>Year:</strong> ${payload.year || 'Not provided'}</p>
    <p><strong>Make:</strong> ${payload.make || 'Not provided'}</p>
    <p><strong>Model:</strong> ${payload.model || 'Not provided'}</p>
    <p><strong>Service:</strong> ${payload.service || 'Not provided'}</p>
    <p><strong>Notes:</strong> ${payload.notes || 'No notes provided'}</p>
    ${photoText}
  `;

  const attachment = payload.vehicle_photo_data
    ? [{
        filename: payload.vehicle_photo_name || 'vehicle-photo.jpg',
        content: parseDataUrl(payload.vehicle_photo_data)?.base64 || ''
      }]
    : [];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [notifyEmail],
      reply_to: payload.email || payload.phone || notifyEmail,
      subject: `New quote request from ${customerName}`,
      html: htmlBody,
      attachments: attachment.length ? attachment : undefined
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Resend email failed:', errText);
  }
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed.'
      })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || '').trim();
    const year = (data.year || '').trim();
    const make = (data.make || '').trim();
    const model = (data.model || '').trim();
    const serviceArea = (data.service_area || '').trim();
    const service = (data.service || '').trim();
    const notes = (data.notes || '').trim();
    const vehiclePhotoName = (data.vehicle_photo_name || '').trim();
    const vehiclePhotoData = (data.vehicle_photo_data || '').trim();

    if (!name || !year || !make || !model || !serviceArea || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Please complete all required fields before submitting.'
        })
      };
    }

    if (!email && !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Please provide either an email address or phone number.'
        })
      };
    }

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || 'Leads';

    if (!apiKey || !baseId) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Airtable is not configured yet. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID.'
        })
      };
    }

    const base = new Airtable({ apiKey }).base(baseId);

    await base(tableName).create({
      fields: {
        Name: name,
        Email: email || '',
        Phone: phone || '',
        'Service Area': serviceArea,
        Year: Number(year),
        Make: make,
        Model: model,
        Service: service,
        Notes: notes || '',
        'Vehicle Photo Name': vehiclePhotoName || '',
        'Submitted At': new Date().toISOString()
      }
    });

    await sendNotificationEmail({
      name,
      email,
      phone,
      service_area: serviceArea,
      year,
      make,
      model,
      service,
      notes,
      vehicle_photo_name: vehiclePhotoName,
      vehicle_photo_data: vehiclePhotoData
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Quote request submitted successfully.'
      })
    };
  } catch (error) {
    console.error('Quote submission failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Unable to save your request right now. Please try again later.'
      })
    };
  }
};
