package com.subflow.smsparser

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log

class SmsReceiver : BroadcastReceiver() {
    
    companion object {
        private const val TAG = "SubFlowSMS"
        private val MTN_SENDERS = listOf("MTN", "MoMo", "MTNMoMo", "MTNMM")
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
        
        val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
        
        for (sms in messages) {
            val sender = sms.displayOriginatingAddress ?: continue
            val body = sms.messageBody ?: continue
            
            // Check if SMS is from MTN MoMo
            if (MTN_SENDERS.any { sender.contains(it, ignoreCase = true) }) {
                Log.d(TAG, "MTN MoMo SMS received: $body")
                processMoMoSms(context, body)
            }
        }
    }
    
    private fun processMoMoSms(context: Context, smsBody: String) {
        val parsedData = SmsParser.parse(smsBody)
        
        if (parsedData != null) {
            Log.d(TAG, "Parsed: amount=${parsedData.amount}, sender=${parsedData.senderPhone}, ref=${parsedData.reference}")
            
            // Submit to SubFlow API
            SubFlowApiService.submitSmsPayment(
                context = context,
                rawSms = smsBody,
                parsedAmount = parsedData.amount,
                parsedSender = parsedData.senderPhone,
                parsedReference = parsedData.reference,
                parsedTransactionId = parsedData.transactionId
            )
        }
    }
}

object SmsParser {
    
    data class ParsedSms(
        val amount: Double,
        val senderPhone: String?,
        val reference: String?,
        val transactionId: String?
    )
    
    // Regex patterns for MTN MoMo South Sudan
    private val amountPattern = Regex("""SSP\s*([\d,]+(?:\.\d{2})?)""", RegexOption.IGNORE_CASE)
    private val phonePattern = Regex("""\+?211\d{9}|\b0\d{9}\b""")
    private val referencePattern = Regex("""SF-[A-Z0-9-]+""", RegexOption.IGNORE_CASE)
    private val transactionPattern = Regex("""(?:Transaction\s*(?:ID)?|TXN|Txn)[:\s]*([A-Z0-9]+)""", RegexOption.IGNORE_CASE)
    
    fun parse(smsBody: String): ParsedSms? {
        // Extract amount
        val amountMatch = amountPattern.find(smsBody)
        val amount = amountMatch?.groupValues?.get(1)
            ?.replace(",", "")
            ?.toDoubleOrNull() ?: return null
        
        // Extract phone number
        val phoneMatch = phonePattern.find(smsBody)
        val senderPhone = phoneMatch?.value
        
        // Extract reference code
        val refMatch = referencePattern.find(smsBody)
        val reference = refMatch?.value
        
        // Extract transaction ID
        val txnMatch = transactionPattern.find(smsBody)
        val transactionId = txnMatch?.groupValues?.get(1)
        
        return ParsedSms(
            amount = amount,
            senderPhone = senderPhone,
            reference = reference,
            transactionId = transactionId
        )
    }
}

object SubFlowApiService {
    
    private const val API_BASE_URL = "https://your-subflow-app.com/api/v1"
    
    fun submitSmsPayment(
        context: Context,
        rawSms: String,
        parsedAmount: Double,
        parsedSender: String?,
        parsedReference: String?,
        parsedTransactionId: String?
    ) {
        // Get API key from secure storage
        val prefs = context.getSharedPreferences("subflow_config", Context.MODE_PRIVATE)
        val apiKey = prefs.getString("api_key", null) ?: return
        val merchantId = prefs.getString("merchant_id", null) ?: return
        
        // Use WorkManager or Coroutines for actual API call
        // This is a skeleton - implement with proper networking library
        
        val payload = mapOf(
            "merchant_id" to merchantId,
            "raw_sms" to rawSms,
            "parsed_amount" to parsedAmount,
            "parsed_sender" to parsedSender,
            "parsed_reference" to parsedReference,
            "parsed_transaction_id" to parsedTransactionId
        )
        
        // TODO: Implement actual HTTP POST to $API_BASE_URL/sms/submit
        // Use Retrofit, OkHttp, or Ktor
        // Include header: Authorization: Bearer $apiKey
    }
}
