# 🔑 How to Get OpenAI API Key

**Step-by-Step Guide to Obtain OpenAI API Key for AI Chat Feature**

---

## 📋 Prerequisites

- Email address (for account creation)
- Credit card or payment method (OpenAI requires payment setup for API access)
- Internet connection

---

## 🚀 Step-by-Step Instructions

### Step 1: Create OpenAI Account

1. **Go to OpenAI Website**
   - Visit: https://platform.openai.com
   - Click **"Sign Up"** or **"Get Started"**

2. **Sign Up Options**
   - Sign up with **Google** account (easiest)
   - Sign up with **Microsoft** account
   - Sign up with **Email** address

3. **Verify Email**
   - Check your email inbox
   - Click verification link
   - Complete account setup

---

### Step 2: Add Payment Method

**Important:** OpenAI requires a payment method to use the API (even for free tier usage).

1. **Go to Billing Settings**
   - After logging in, click your **profile icon** (top right)
   - Select **"Billing"** or **"Settings"** → **"Billing"**

2. **Add Payment Method**
   - Click **"Add payment method"**
   - Enter credit card details
   - Or use other payment methods if available

3. **Set Usage Limits (Optional but Recommended)**
   - Go to **"Usage limits"** or **"Billing limits"**
   - Set monthly spending limit (e.g., $10, $20, $50)
   - This prevents unexpected charges

---

### Step 3: Generate API Key

1. **Navigate to API Keys**
   - Click your **profile icon** (top right)
   - Select **"API keys"** or go to: https://platform.openai.com/api-keys

2. **Create New API Key**
   - Click **"Create new secret key"** button
   - Enter a name for the key (e.g., "Alumni Portal AI Chat")
   - Click **"Create secret key"**

3. **Copy the API Key**
   - **⚠️ IMPORTANT:** Copy the key immediately
   - The key will only be shown once
   - Format: `sk-proj-...` or `sk-...`
   - Example: `sk-proj-abc123xyz789...`

4. **Save the Key Securely**
   - Store in password manager
   - Or save in `.env` file (see Step 4)

---

### Step 4: Add to Your Project

1. **Open `.env` File**
   ```bash
   # In your project root
   .env
   ```

2. **Add API Key**
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-api-key-here
   OPENAI_MODEL=text-embedding-3-small
   ```

3. **Never Commit `.env` to Git**
   - Make sure `.env` is in `.gitignore`
   - Never share your API key publicly

---

## 💰 Pricing Information

### Current Pricing (as of 2024)

**Embeddings (for document search):**
- `text-embedding-3-small`: $0.02 per 1M tokens
- `text-embedding-3-large`: $0.13 per 1M tokens
- `text-embedding-ada-002`: $0.10 per 1M tokens

**Chat Completions (for AI responses):**
- `gpt-3.5-turbo`: $0.50 per 1M input tokens, $1.50 per 1M output tokens
- `gpt-4`: Higher cost (check current pricing)

### Estimated Costs for Alumni Portal

**Per Chat Message:**
- Embedding generation: ~$0.0001 (very cheap)
- Chat response: ~$0.001-0.002 (depends on response length)

**Monthly Estimate (1000 messages):**
- Embeddings: ~$0.10
- Chat responses: ~$1-2
- **Total: ~$1-3 per month** (for 1000 messages)

**Cost Control:**
- Set usage limits in OpenAI dashboard
- Monitor usage regularly
- Use cheaper models for embeddings

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use environment variables in production
- Set usage limits in OpenAI dashboard
- Rotate keys periodically
- Monitor API usage

### ❌ DON'T:
- Commit API key to Git
- Share API key publicly
- Hardcode API key in source code
- Use same key for development and production
- Leave keys in code comments

---

## 🧪 Test Your API Key

### Quick Test (Python)

```python
import openai
import os
from dotenv import load_dotenv

load_dotenv()

# Test API key
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    # Test embedding
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input="Test text"
    )
    print("✅ API Key is valid!")
    print(f"Embedding dimension: {len(response.data[0].embedding)}")
except Exception as e:
    print(f"❌ Error: {e}")
```

### Test in Your Project

```bash
# Start your FastAPI server
python -m uvicorn app.main:app --reload

# Upload a test document
# Send a chat message
# Check if it works!
```

---

## 🆘 Troubleshooting

### Issue: "Invalid API Key"

**Solutions:**
1. Check if key is copied correctly (no extra spaces)
2. Verify key starts with `sk-`
3. Check if key is active in OpenAI dashboard
4. Ensure `.env` file is loaded correctly

### Issue: "Insufficient Quota"

**Solutions:**
1. Add payment method to OpenAI account
2. Check billing settings
3. Verify payment method is valid
4. Check usage limits

### Issue: "Rate Limit Exceeded"

**Solutions:**
1. Wait a few minutes
2. Check your usage tier
3. Upgrade to higher tier if needed
4. Implement request throttling

### Issue: "API Key Not Found"

**Solutions:**
1. Check `.env` file exists
2. Verify `OPENAI_API_KEY` variable name
3. Restart your application after adding key
4. Check if `.env` is in project root

---

## 📚 Additional Resources

- **OpenAI Platform:** https://platform.openai.com
- **API Documentation:** https://platform.openai.com/docs
- **Pricing:** https://openai.com/pricing
- **Usage Dashboard:** https://platform.openai.com/usage
- **API Keys Management:** https://platform.openai.com/api-keys

---

## ✅ Quick Checklist

- [ ] Created OpenAI account
- [ ] Added payment method
- [ ] Generated API key
- [ ] Copied and saved API key securely
- [ ] Added to `.env` file
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested API key works
- [ ] Set usage limits in OpenAI dashboard

---

## 🎯 For Your Project

Once you have the API key:

1. **Add to `.env`:**
   ```env
   OPENAI_API_KEY=sk-proj-your-key-here
   OPENAI_MODEL=text-embedding-3-small
   ```

2. **Restart your server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

3. **Test:**
   - Upload a document
   - Wait for processing
   - Send a chat message
   - Verify AI response works!

---

**Need Help?**
- OpenAI Support: https://help.openai.com
- Check OpenAI status: https://status.openai.com

---

**Last Updated:** December 10, 2025

