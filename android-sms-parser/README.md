# SubFlow SMS Parser - Android App

This Android app parses incoming MTN MoMo SMS messages and automatically submits payment information to the SubFlow backend for semi-automated payment confirmation.

## Features

- **SMS Listening**: Monitors incoming SMS from MTN MoMo
- **Payment Parsing**: Extracts amount, sender, transaction ID from SMS
- **Auto-Submit**: Sends parsed data to SubFlow API
- **Background Service**: Runs continuously in background
- **Secure**: Uses merchant API keys for authentication

## Requirements

- Android 6.0 (API 23) or higher
- SMS read permission
- Internet permission
- SubFlow merchant account with API keys

## Setup

1. Install the APK on your Android device
2. Grant SMS and notification permissions
3. Enter your SubFlow API credentials in Settings
4. Enable the SMS listener service

## SMS Patterns Supported

### MTN MoMo South Sudan
```
You have received SSP X,XXX from PHONE_NUMBER. Reference: REF_CODE. Transaction ID: TXN_ID
```

## API Integration

The app sends parsed SMS data to:
```
POST /api/v1/sms/submit
{
  "raw_sms": "original SMS text",
  "parsed_amount": 10000,
  "parsed_sender": "+211912345678",
  "parsed_reference": "SF-ABC123",
  "parsed_transaction_id": "TXN123456"
}
```

## Build Instructions

1. Open project in Android Studio
2. Configure `local.properties` with SDK path
3. Build release APK: `./gradlew assembleRelease`

## Security Notes

- API keys are stored in Android Keystore
- SMS data is only transmitted over HTTPS
- No SMS content is stored locally after processing
