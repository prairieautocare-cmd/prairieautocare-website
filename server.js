const express = require('express');
const path = require('path');
const Airtable = require('airtable');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;
const airtableTableName = process.env.AIRTABLE_TABLE_NAME || 'Quotes';

if (!airtableApiKey || !airtableBaseId) {
  console.warn('Airtable environment variables are missing. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID to your .env file before submitting forms.');
}

const base = airtableApiKey && airtableBaseId
  ? new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId)
  : null;

app.post('/api/quote', async (req, res) => {
  const data = { ...req.body };
  const name = (data.name || '').trim();
  const email = (data.email || '').trim();
  const phone = (data.phone || '').trim();
  const year = (data.year || '').trim();
  const make = (data.make || '').trim();
  const model = (data.model || '').trim();
  const serviceArea = (data.service_area || '').trim();
  const service = (data.service || '').trim();
  const notes = (data.notes || '').trim();

  if (!name || !year || !make || !model || !serviceArea || !service) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all required fields before submitting.'
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide either an email address or a phone number.'
    });
  }

  if (!base) {
    return res.status(500).json({
      success: false,
      message: 'Airtable is not configured yet. Add AIRTABLE_API_KEY and AIRTABLE_BASE_ID.'
    });
  }

  try {
    const record = {
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
        'Submitted At': new Date().toISOString()
      }
    };

    await base(airtableTableName).create(record);

    return res.status(200).json({
      success: true,
      message: 'Quote request submitted successfully.'
    });
  } catch (error) {
    console.error('Airtable create failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to save your request right now. Please try again later.'
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Prairie Auto Care backend is running.' });
});

app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path.replace(/^\//, ''));
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Prairie Auto Care backend running at http://localhost:${PORT}`);
});
