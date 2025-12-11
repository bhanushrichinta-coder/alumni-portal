# 🆓 How to Get FREE AI API Keys for LangChain

**Complete Guide to Set Up FREE AI Services Using LangChain**

This project now uses **LangChain** with **FREE AI APIs**:
- **Groq** - FREE AI chat (very fast!)
- **Hugging Face** - FREE embeddings (or use local models)

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Get Groq API Key (FREE - No Credit Card!)

1. **Visit Groq Console**
   - Go to: https://console.groq.com
   - Click **"Sign Up"** or **"Get Started"**

2. **Sign Up Options**
   - Sign up with **Google** (easiest)
   - Sign up with **GitHub**
   - Sign up with **Email**

3. **Create API Key**
   - After login, go to: https://console.groq.com/keys
   - Click **"Create API Key"**
   - Give it a name (e.g., "Alumni Portal")
   - Click **"Submit"**
   - **Copy the key immediately** (starts with `gsk_...`)
   - ⚠️ **You can only see it once!**

4. **Add to `.env` file:**
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   GROQ_MODEL=llama-3.1-70b-versatile
   ```

**✅ That's it! Groq is FREE and requires NO credit card!**

---

### Step 2: Get Hugging Face Token (FREE - No Credit Card!)

**Option A: Use Hugging Face API (Recommended for Production)**

1. **Visit Hugging Face**
   - Go to: https://huggingface.co
   - Click **"Sign Up"**

2. **Create Account**
   - Sign up with **Google/GitHub/Email**
   - Verify your email

3. **Get API Token**
   - Go to: https://huggingface.co/settings/tokens
   - Click **"New token"**
   - Name it (e.g., "Alumni Portal Embeddings")
   - Select **"Read"** permission (enough for embeddings)
   - Click **"Generate token"**
   - **Copy the token** (starts with `hf_...`)

4. **Add to `.env` file:**
   ```env
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
   USE_LOCAL_EMBEDDINGS=False
   ```

**Option B: Use Local Embeddings (No API Key Needed!)**

If you don't want to use an API key, you can run embeddings locally:

```env
USE_LOCAL_EMBEDDINGS=True
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
# No HUGGINGFACE_API_KEY needed!
```

**Note:** Local embeddings download the model once (~80MB) and run on your machine. Slower but completely free and private!

---

## 📝 Complete `.env` Configuration

Add these lines to your `.env` file:

```env
# ============================================
# FREE AI SERVICES (LangChain)
# ============================================

# Groq (FREE - AI Chat)
GROQ_API_KEY=gsk_your_groq_key_here
GROQ_MODEL=llama-3.1-70b-versatile

# Hugging Face (FREE - Embeddings)
# Option 1: Use API (requires token)
HUGGINGFACE_API_KEY=hf_your_huggingface_token_here
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
USE_LOCAL_EMBEDDINGS=False

# Option 2: Use Local (no API key needed)
# USE_LOCAL_EMBEDDINGS=True
# HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
# HUGGINGFACE_API_KEY=  # Not needed for local

# ============================================
# Optional: OpenAI (Fallback - Not Free)
# ============================================
# OPENAI_API_KEY=sk-proj-your-key-here  # Only if you want to use OpenAI instead
# OPENAI_MODEL=text-embedding-3-small
```

---

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `langchain` - AI framework
- `langchain-community` - Community integrations
- `langchain-groq` - Groq integration
- `sentence-transformers` - For local embeddings (optional)

### 2. Update `.env` File

Add your API keys as shown above.

### 3. Restart Your Server

```bash
python -m uvicorn app.main:app --reload
```

### 4. Test It!

Upload a document and try chatting with it!

---

## 🎨 Available Groq Models

You can change `GROQ_MODEL` in `.env`:

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `llama-3.1-70b-versatile` | Fast | High | **Recommended** - Best balance |
| `llama-3.1-8b-instant` | Very Fast | Good | Quick responses |
| `mixtral-8x7b-32768` | Fast | High | Long context (32K tokens) |
| `gemma-7b-it` | Very Fast | Good | Fast responses |

**Default:** `llama-3.1-70b-versatile` (best quality)

---

## 🔧 Available Embedding Models

You can change `HUGGINGFACE_EMBEDDING_MODEL` in `.env`:

| Model | Dimensions | Speed | Quality |
|-------|-------------|-------|---------|
| `sentence-transformers/all-MiniLM-L6-v2` | 384 | Very Fast | Good (Default) |
| `sentence-transformers/all-mpnet-base-v2` | 768 | Fast | Better |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | 384 | Fast | Multilingual |

**Default:** `all-MiniLM-L6-v2` (fast and efficient)

---

## 💰 Cost Comparison

| Service | Cost | Speed | Quality |
|---------|------|-------|---------|
| **Groq Chat** | **FREE** | ⚡ Very Fast | ⭐⭐⭐⭐ High |
| **Hugging Face API** | **FREE** | ⚡ Fast | ⭐⭐⭐ Good |
| **Local Embeddings** | **FREE** | 🐢 Slower | ⭐⭐⭐ Good |
| OpenAI Chat | ~$0.001-0.002/msg | 🐢 Medium | ⭐⭐⭐⭐⭐ Excellent |
| OpenAI Embeddings | ~$0.0001/embedding | ⚡ Fast | ⭐⭐⭐⭐⭐ Excellent |

**Recommendation:** Use Groq + Hugging Face for **100% FREE** setup!

---

## 🔒 Security Best Practices

### ✅ DO:
- Store API keys in `.env` file
- Add `.env` to `.gitignore`
- Never commit API keys to Git
- Use environment variables in production
- Rotate keys periodically

### ❌ DON'T:
- Commit `.env` to Git
- Share API keys publicly
- Hardcode keys in source code
- Use same key for dev and production

---

## 🧪 Testing Your Setup

### Test Groq API Key

```python
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv

load_dotenv()

# Test Groq
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama-3.1-70b-versatile"
)

response = llm.invoke("Hello! Say 'API key works!' if you can read this.")
print(response.content)
```

### Test Hugging Face Embeddings

```python
from langchain_community.embeddings import HuggingFaceInferenceAPIEmbeddings
import os
from dotenv import load_dotenv

load_dotenv()

# Test Hugging Face API
embeddings = HuggingFaceInferenceAPIEmbeddings(
    api_key=os.getenv("HUGGINGFACE_API_KEY"),
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

result = embeddings.embed_query("Test text")
print(f"✅ Embedding dimension: {len(result)}")
```

---

## 🆘 Troubleshooting

### Issue: "Groq API key not configured"

**Solution:**
1. Check `.env` file has `GROQ_API_KEY=...`
2. Verify key starts with `gsk_`
3. Restart your server after adding key
4. Check key is active at https://console.groq.com/keys

### Issue: "Hugging Face API key not configured"

**Solution:**
1. Check `.env` file has `HUGGINGFACE_API_KEY=...`
2. Verify key starts with `hf_`
3. Or set `USE_LOCAL_EMBEDDINGS=True` to use local embeddings
4. Restart your server

### Issue: "Rate limit exceeded" (Groq)

**Solution:**
- Groq has generous free limits
- Wait a few minutes and try again
- Check your usage at https://console.groq.com

### Issue: "Model not found" (Hugging Face)

**Solution:**
1. Check model name is correct
2. For local embeddings, model downloads automatically on first use
3. Ensure you have internet connection for first download

### Issue: Local embeddings are slow

**Solution:**
- This is normal - local embeddings run on your CPU
- For faster performance, use Hugging Face API instead
- Or set `USE_LOCAL_EMBEDDINGS=False` and use API

---

## 📚 Additional Resources

- **Groq Console:** https://console.groq.com
- **Groq Documentation:** https://console.groq.com/docs
- **Hugging Face:** https://huggingface.co
- **Hugging Face Models:** https://huggingface.co/models
- **LangChain Docs:** https://python.langchain.com
- **LangChain Groq:** https://python.langchain.com/docs/integrations/llms/groq
- **LangChain Hugging Face:** https://python.langchain.com/docs/integrations/text_embedding/huggingface

---

## ✅ Quick Checklist

- [ ] Created Groq account
- [ ] Generated Groq API key
- [ ] Created Hugging Face account (or using local embeddings)
- [ ] Generated Hugging Face token (if using API)
- [ ] Added keys to `.env` file
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Restarted server
- [ ] Tested chat functionality
- [ ] Tested document upload and embeddings

---

## 🎉 You're All Set!

Your Alumni Portal now uses **100% FREE AI services** with LangChain:
- ✅ **Groq** for fast, free AI chat
- ✅ **Hugging Face** for free embeddings (or local)
- ✅ **LangChain** for unified AI framework

**No credit cards required!** 🎊

---

**Last Updated:** December 10, 2025

