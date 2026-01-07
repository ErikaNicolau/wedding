const SHEET_ID = '15VrbrEp4Z_hAgKZNJ1UMQ4JrJLd8Vbkh-ED7MICfXTE';

// Email addresses to receive notifications
const EMAIL_1 = 'alex_istrate594@yahoo.com';
const EMAIL_2 = 'alex.istrate594@yahoo.com';
const EMAIL_3 = 'aerika04@yahoo.com'; 

function doPost(e) {
  try {
    if (SHEET_ID === 'YOUR_SHEET_ID' || !SHEET_ID) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Sheet ID not configured. Please set SHEET_ID in the script.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    } catch (error) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Cannot access spreadsheet. Check Sheet ID and sharing.'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = spreadsheet.getActiveSheet();

    let data = {};
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (_) {
        data = e.parameter || {};
      }
    }

    const rowData = [
      new Date(),
      (data.name || '').toString(),
      (data.attending || '').toString(),
      (data.details || '').toString(),
      (data.attendance || '').toString()
    ];

    sheet.appendRow(rowData);

    // Try to send email notification
    let emailResult = false;
    try {
      emailResult = sendEmailNotification(data);
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Email sending error:', emailError.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(data) {
  // Safety check: ensure data exists
  if (!data || typeof data !== 'object') {
    return false;
  }

  const emailAddresses = [EMAIL_1, EMAIL_2, EMAIL_3].filter(
    email => email && email.trim() !== '' && !email.includes('example.com')
  );

  if (emailAddresses.length === 0) return false;

  const attendanceText =
    (data.attendance === 'yes')
      ? 'Da, confirm prezența'
      : 'Nu pot să particip';

  const subject = '🎉 Nouă confirmare - ' + (data.name || 'Invitat');

  const body = `
Ceaules!

Ați primit un nou raspuns pentru nuntă aia bengoasa.

📋 Detalii confirmare:

👤 Nume: ${data.name || 'N/A'}
👥 Număr persoane: ${data.attending || 'N/A'}
✅ Confirmare prezență: ${attendanceText}
${data.details ? '💬 Mesaj: ' + data.details : ''}


Va puuup,
IERI.SRL
  `.trim();

  try {
    MailApp.sendEmail({
      to: emailAddresses.join(','),
      subject: subject,
      body: body
    });
    console.log('Email sent successfully to:', emailAddresses.join(', '));
    return true;
  } catch (error) {
    console.error('Failed to send email:', error.toString());
    console.error('Email addresses:', emailAddresses);
    // Try sending to each email individually if batch fails
    try {
      emailAddresses.forEach(email => {
        MailApp.sendEmail({
          to: email,
          subject: subject,
          body: body
        });
      });
      console.log('Emails sent individually');
      return true;
    } catch (individualError) {
      console.error('Failed to send emails individually:', individualError.toString());
      return false;
    }
  }
}
