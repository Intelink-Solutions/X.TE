<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New booking request</title>
</head>
<body style="margin:0;background:#f5f3f6;font-family:Arial,sans-serif;color:#211820">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;background:#f5f3f6">
    <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden">
            <tr><td style="padding:24px;background:#1a0b18;color:#ffffff">
                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#db70cc">X'Touch Entertainment</div>
                <h1 style="margin:8px 0 0;font-size:24px">New booking request</h1>
            </td></tr>
            <tr><td style="padding:24px">
                <p style="margin:0 0 20px;color:#655b64">A new booking was submitted from the website. Reply to this email to contact {{ $booking->client_name }}.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    @foreach([
                        'Reference' => $booking->reference,
                        'Service' => $booking->service_type,
                        'Name' => $booking->client_name,
                        'Email' => $booking->client_email,
                        'Phone' => $booking->client_phone ?: 'Not provided',
                        'Preferred date' => $booking->preferred_date?->format('F j, Y'),
                        'Preferred time' => $booking->preferred_time ?: 'Flexible',
                        'Location' => $booking->location ?: 'Not provided',
                        'Duration' => $booking->duration ?: 'Not provided',
                        'Budget' => $booking->budget ?: 'Not provided',
                        'Attendees' => $booking->attendees ?: 'Not provided',
                        'Preferred reply' => ucfirst($booking->contact_method),
                    ] as $label => $value)
                        <tr>
                            <td style="width:160px;padding:8px 12px 8px 0;border-bottom:1px solid #eee;color:#746a72;font-size:13px">{{ $label }}</td>
                            <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px">{{ $value }}</td>
                        </tr>
                    @endforeach
                </table>
                <h2 style="margin:24px 0 8px;font-size:16px">Project details</h2>
                <div style="padding:16px;border-radius:10px;background:#faf7fa;white-space:pre-wrap;line-height:1.6">{{ $booking->project_details }}</div>
            </td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
