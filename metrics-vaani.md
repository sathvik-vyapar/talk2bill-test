# VAANI Metrics Dashboard
## Complete Performance Analytics (Last 30 Days: Nov 22 - Dec 22, 2024)

Last Updated: December 22, 2024  
Data Source: Mixpanel Analytics

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Conversion Funnels](#conversion-funnels)
3. [User Engagement](#user-engagement)
4. [Retention & Satisfaction](#retention--satisfaction)
5. [Feature Usage](#feature-usage)
6. [Exit Analysis](#exit-analysis)
7. [Missing Metrics (Need Data)](#missing-metrics-need-data)
8. [Appendix: Calculation Formulas](#appendix-metrics-calculation-formulas)

---

## EXECUTIVE SUMMARY

### Key Metrics at a Glance

| Metric | Current Value | Note |
|--------|--------------|------|
| **Overall Success Rate** | 9.42% | Low |
| **Total Expenses Saved** | 1,487 events | 30-day period |
| **Unique Users** | 1,092 users | 30-day period |
| **D1 Retention** | ~15% | Below benchmark |
| **D5 Retention** | ~2-3% | Below benchmark |
| **D30 Retention** | ~1-2% | Below benchmark |
| **User Satisfaction (5★)** | 62.9% (22/35) | Small sample |
| **First-Time Completion** | 47.88% | Mic button click rate |

### Critical Issues

1. **Low Success Rate**: 9.42% completion rate
2. **Poor Retention**: 98% users don't return after Day 5
3. **High Exit Rate**: 2,389 exits in last 7 days
4. **Understanding Issues**: 422 users report "VAANI didn't understand me"

---

## CONVERSION FUNNELS

### 1. Central Funnel (4-Step) - VAANI Expense
**Overall Conversion: 9.42%**

| Step | Users | Conversion | Drop-off |
|------|-------|------------|----------|
| 1. Start | 11,000 | 100% | - |
| 2. Recording Done | 5,462 | 49.04% | **50.96% DROP** |
| 3. Voice Processed | 4,673 | 85.55% | 14.45% drop |
| 4. Expense Saved | 1,037 | 22.19% | **77.81% DROP** |

**Analysis:**
- **Biggest Drop #1**: Start → Recording Done (51% drop)
  - Users open VAANI but don't complete recording
  
- **Biggest Drop #2**: Voice Processed → Expense Saved (78% drop)
  - Voice is processed but expense not saved

**Drop-off Points:**
```
11,000 users start
    ↓ 50.96% DROP
5,462 complete recording  
    ↓ 14.45% drop (good!)
4,673 voice processed
    ↓ 77.81% DROP
1,037 expenses saved
```

---

### 2. Simplified Funnel (2-Step) - From Pop-up
**Overall Conversion: 14.18%**

| Step | Users | Conversion |
|------|-------|------------|
| 1. VN_intro_popup_use_vaani | 6,100 | 100% |
| 2. VN_expense_saved | 865 | 14.18% |

**Analysis:**
- Better than 4-step funnel (14.18% vs 9.42%)
- Still very low overall
- 85.82% drop between seeing popup and saving expense

---

### 3. First-Time Experience Funnel
**Overall Conversion: 47.88%**

| Step | Users | Conversion |
|------|-------|------------|
| 1. VN_session_started | 9,777 | 100% |
| 2. VN_mic_button_clicked | 4,681 | 47.88% |

**Analysis:**
- 52% of first-time users never click the mic button
- Onboarding issue indicated

---

### 4. Session Overall Funnel
**Overall Conversion: 91.4%**

| Step | Users | Conversion |
|------|-------|------------|
| 1. VN_opened | 11,000 | 100% |
| 2. VN_session_started | 11,000 | 100% |
| 3. VN_session_ended | 10,046 | 91.4% |

**Analysis:**
- Most users (91.4%) complete the session
- 8.6% abandon mid-session
- Session completion rate is high

---

## USER ENGAGEMENT

### Expenses Saved (Last 30 Days)

**Total Events:** 1,487 expenses saved  
**Unique Users:** 1,092 users  
**Average per User:** 1.36 expenses/user

**Analysis:**
- Low repeat usage
- Most users save 1 expense and don't return

---

### VAANI Initiations (Daily Trend)

**Source:** VN_intro_popup_use_vaani event

**Trend (Nov 22 - Dec 22):**
- Started at ~300 users/day
- Dropped to ~250-280 users/day
- Further dropped to ~150-200 users/day by Dec 22
- **29% decline over 30 days**

**Analysis:**
- Usage is declining, not growing
- Users are trying once and not returning
- Activation problem, not discovery problem

---

### Audio Uploads (Last 7 Days)

**Daily Trend:**
- Nov 22: ~100-150 users
- Dec 10: ~200 users (peak)
- Dec 22: ~300-400 users (recent spike)

**Analysis:**
- Recent spike in usage (positive trend)
- Peak reached on Dec 22 at 300-400 users

---

## RETENTION & SATISFACTION

### Retention Curve (30-Day)

| Day | Retention Rate | Users Returning |
|-----|----------------|-----------------|
| Day 1 | ~15% | High drop from Day 0 |
| Day 2 | ~3% | Steep decline |
| Day 5 | ~2-3% | Stabilizes |
| Day 10 | ~2% | Slow decline |
| Day 30 | ~1-2% | Very low |

**Analysis:**
- 85% users never return after Day 1
- 98% users gone by Day 5
- 99% users gone by Day 30

**Benchmark Comparison:**
- Industry Good: 40%+ D1, 20%+ D7, 10%+ D30
- VAANI Current: 15% D1, 2% D7, 1% D30
- Gap: VAANI retention is 4-10x lower than benchmark

---

### User Feedback Scores (Last 30 Days)

**Total Feedback Events:** 35

| Rating | Count | Percentage |
|--------|-------|------------|
| ⭐⭐⭐⭐⭐ (5 stars) | 22 | 62.9% |
| ⭐⭐⭐ (3 stars) | 6 | 17.1% |
| ⭐ (1 star) | 4 | 11.4% |
| ⭐⭐ (2 stars) | 2 | 5.7% |
| ⭐⭐⭐⭐ (4 stars) | 1 | 2.9% |

**Analysis:**
- 62.9% give 5 stars
- 34.2% give ≤3 stars
- Only 35 feedback events from 1,092 users (3.2% response rate)
- Sample may be biased (satisfied users more likely to give feedback)

**Net Promoter Score (NPS) Estimate:**
- Promoters (5★): 62.9%
- Passives (3-4★): 20.0%
- Detractors (1-2★): 17.1%
- **NPS = 62.9% - 17.1% = 45.8** (Decent)

---

## FEATURE USAGE

### Item & Category Selection Box (Last 30 Days)

**Feature Usage:**
- **Item Suggestions Used:** 94 users
- **Category Suggestions Used:** 74 events

**Analysis:**
- Low usage of suggestions
- Most users either don't see suggestions, don't trust them, or find them irrelevant

---

## EXIT ANALYSIS

### Exit Reasons - Last 7 Days

**Total Exits:** 2,389 events from 2,083 unique users

| Exit Reason | Count | Unique Users | % of Total |
|-------------|-------|--------------|------------|
| Others | 1,079 | 1,019 | 45.2% |
| Vaani didn't understand me | 422 | 403 | 17.7% |
| Just testing | 357 | 326 | 14.9% |
| Too slow | 122 | 118 | 5.1% |
| Made a mistake | 79 | 65 | 3.3% |

**Analysis:**

1. **"Others" (45.2%)**
   - Largest category but vague
   - 1,019 unique users

2. **"VAANI didn't understand me" (17.7%)**
   - 422 users (403 unique)
   - Explicit AI accuracy issue

3. **"Just testing" (14.9%)**
   - 357 events (326 unique users)
   - Users exploring, not real usage intent

4. **"Too slow" (5.1%)**
   - 122 users (118 unique)
   - Performance issue

5. **"Made a mistake" (3.3%)**
   - 79 users (65 unique)
   - User error during recording

**Weekly Exit Rate:**
- 2,389 exits / 7 days = **341 exits per day**
- With ~200-300 daily users = **100%+ daily exit rate**
- Confirms: Users try once, exit, don't return

---

## MISSING METRICS (NEED DATA)

### Critical Missing Metrics

#### 1. Performance Metrics
- [ ] **Average Latency** (end-to-end)
- [ ] **P50, P95, P99 Latency**
- [ ] **Time to First Response**

#### 2. Accuracy Metrics
- [ ] **Intent Detection Accuracy** (by intent type)
- [ ] **Extraction Accuracy** (items, amounts, categories)
- [ ] **Category Assignment Accuracy**

#### 3. User Behavior Metrics
- [ ] **Average Session Duration**
- [ ] **Words Spoken Distribution** (per session)
- [ ] **Retry Rate** (after failure)
- [ ] **Edit Rate** (% who edit before saving, which fields edited)

#### 4. Cost Metrics
- [ ] **Cost per Transaction** (STT + LLM breakdown)
- [ ] **Monthly API Spend**
- [ ] **Cost per Successful Transaction**

#### 5. Feature-Specific Metrics
- [ ] **Multi-Item Usage** (% with multiple items, success rate comparison)
- [ ] **Question Asked Rate** (frequency, average per session)
- [ ] **"Yes/Okay" Response Rate** (trend over time)

#### 6. Segmentation Metrics
- [ ] **Success Rate by Business Type** (Retailer, Restaurant, Service)
- [ ] **Success Rate by Language** (Hindi, English, Hinglish)
- [ ] **Success Rate by Time of Day** (Morning, Afternoon, Evening)

#### 7. Competitive/Market Metrics
- [ ] **Voice vs Typing Speed** (time saved per transaction)
- [ ] **Feature Awareness** (% of Vyapar users aware of VAANI, % who tried)

#### 8. Technical Health Metrics
- [ ] **Error Rate** (% of sessions with errors)
- [ ] **Crash Rate** (app crashes during VAANI)
- [ ] **API Timeout Rate**

---

## APPENDIX: METRICS CALCULATION FORMULAS

### Success Rate
```
Overall Success Rate = (Expenses Saved / Total Starts) × 100
= (1,037 / 11,000) × 100
= 9.42%
```

### Retention Rate
```
Day N Retention = (Users Active on Day N / Users Active on Day 0) × 100
```

### Average Expenses per User
```
Avg = Total Expenses / Unique Users
= 1,487 / 1,092
= 1.36 expenses/user
```

### Exit Rate
```
Daily Exit Rate = (Daily Exits / Daily Active Users) × 100
= (341 / 250)
= 136% (users exit multiple times)
```

### NPS (Estimated)
```
NPS = % Promoters - % Detractors
= 62.9% - 17.1%
= 45.8
```

---

## DASHBOARD QUERIES (FOR REFERENCE)

### Query 1: Conversion Funnel
```
Event: VN_session_started (Start)
  → VN_recording_done
  → VN_voice_processed
  → VN_expense_saved (Goal)
Date Range: Last 30 days
```

### Query 2: Retention Curve
```
Cohort: Users who did VN_expense_saved
Return Event: VN_expense_saved
Date Range: Last 30 days
View: Retention Rate
```

### Query 3: Exit Reasons
```
Event: VN_exit
Property: exit_reason
Breakdown: Count + Unique Users
Date Range: Last 7 days
```

---

**END OF METRICS DOCUMENT**

---

**Document Version:** 1.0  
**Last Updated:** December 22, 2024  
**Owner:** Akhil Agrawal  
**Data Source:** Mixpanel (Nov 22 - Dec 22, 2024)
