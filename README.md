# মোল্লা বংশের ধারা (Molla Dynasty Genealogy Tree)
**System Developer: JAYED**

ধনাউল্লা মোল্লার বংশলতিকা এবং বংশধারা প্রদর্শনের জন্য একটি আধুনিক, ইন্টারঅ্যাক্টিভ ও ভিজ্যুয়াল ফ্যামিলি ট্রি অ্যাপ্লিকেশন।

---

## 🚀 GitHub Pages-এ লাইভ করার সহজ নিয়ম (Live on GitHub Pages)

এই প্রজেক্টটি **১০০% GitHub Pages Ready** করে তৈরি করা হয়েছে। 

### গিটহাবে আপলোড করার কমান্ড:
```bash
git init
git add .
git commit -m "Molla Family Tree Live"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/<আপনার-রেপোর-নাম>.git
git push -u origin main
```

---

### 🌐 GitHub-এ লাইভ করার ২টি সহজ উপায় (যেকোনো একটি ব্যবহার করুন):

#### উপায় ১ (সবচেয়ে সহজ - No Build / Instant Live):
1. আপনার GitHub রিপোজিটরির **Settings**-এ যান।
2. বাম পাশের মেনু থেকে **Pages**-এ ক্লিক করুন।
3. **Build and deployment** সেকশনে:
   - **Source**: `Deploy from a branch` নির্বাচন করুন।
   - **Branch**: `main` সিলেক্ট করুন এবং ফোল্ডার সিলেক্ট করুন `/docs`।
   - **Save** বাটনে ক্লিক করুন।
4. ব্যস! রিপোজিটরিতে তৈরি করা `/docs` ফোল্ডার এবং `.nojekyll` থাকায় ৩০ সেকেন্ডের মধ্যে আপনার সাইট লাইভ হয়ে যাবে!

#### উপায় ২ (GitHub Actions অটোমেশন):
1. আপনার GitHub রিপোজিটরির **Settings** -> **Pages**-এ যান।
2. **Source** ড্রপডাউন থেকে **GitHub Actions** নির্বাচন করুন।
3. প্রোজেক্টে থাকা `.github/workflows/deploy.yml` স্বয়ংক্রিয়ভাবে প্রজেক্টটি বিল্ড করে লাইভ করে দেবে।

---

## 🛠️ লোকাল কম্পিউটারে রান করার নিয়ম (Local Development)

```bash
# ডিপেন্ডেন্সি ইন্সটল করুন
npm install --legacy-peer-deps

# ডেভেলপমেন্ট সার্ভার চালু করুন
npm run dev

# প্রোডাকশন বিল্ড ও docs আপডেট
npm run build
```

---

## ✨ বৈশিষ্ট্যসমূহ (Features)
- 🌳 **মূল চিত্ররূপ (Horizontal Tree)**: মূল হস্তলিখিত খসড়ার আদলে অনুভূমিক বংশলতিকা।
- 🌲 **উল্লম্ব বংশবৃক্ষ (Vertical Tree)**: ঐতিহ্যবাহী টপ-ডাউন ফ্যামিলি ট্রি।
- 📑 **প্রজন্ম পরিক্রমা (Generations Matrix)**: ১ম থেকে ৭ম প্রজন্ম পর্যন্ত পূর্ণাঙ্গ বিভাজন।
- 🔍 **শাখাভিত্তিক বিবরণ (Branch Explorer)**: ৫টি মূল শাখার বিস্তারিত রূপ।
- ⚡ **লাইনিয়েজ ট্রেসার (Lineage Tracer)**: যেকোনো সদস্যের ওপর ক্লিক করলে ধনাউল্লা মোল্লা পর্যন্ত রক্তধারা হাইলাইট হয়।
- 🔍 **তাত্ক্ষণিক অনুসন্ধান (Instant Search)**: বাংলা ও ইংরেজি নামে সরাসরি সার্চ।
- 🖨️ **প্রিন্ট ফ্রেন্ডলি (Print Ready)**: পরিচ্ছন্ন প্রিন্ট ও পিডিএফ এক্সপোর্ট।
