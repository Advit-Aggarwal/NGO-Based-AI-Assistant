"""Template-based AI engine for NGO content generation.

No external API key required. The code is structured so you can
swap in an actual LLM (OpenAI, Gemini, local models) later by
replacing the functions below.
"""


def _tone_lead(tone: str) -> str:
    mapping = {
        'urgent': 'Time-sensitive',
        'friendly': 'Heart-led',
    }
    return mapping.get(tone, 'Inspiring')


def _hashtags_for(topic: str, count: int) -> list[str]:
    pool = [
        '#NGO', '#Community', '#Volunteers', '#Donate', '#MakeADifference',
        '#SocialImpact', '#GivingBack', '#Humanity', '#Hope', '#Awareness',
        '#SupportLocal', '#ChangeMakers', '#Youth', '#Education',
        '#Health', '#CleanCity', '#Together', '#Empowerment', '#Kindness',
    ]
    topic_lower = (topic or '').lower()
    extra = []
    if 'health' in topic_lower:
        extra.append('#HealthForAll')
    if 'education' in topic_lower:
        extra.append('#EducationForAll')
    if any(w in topic_lower for w in ('climate', 'environment', 'clean')):
        extra.append('#CleanEnvironment')
    if 'women' in topic_lower:
        extra.append('#WomenEmpowerment')

    merged = extra + pool
    result = merged[:count]
    while len(result) < count:
        result.append('#Impact')
    return result


def generate_donation_campaign(data: dict) -> dict:
    ngo_name = data['ngoName']
    cause = data['cause']
    audience = data.get('audience', 'general supporters')
    target_amount = data.get('targetAmount', 50000)
    deadline = data.get('deadline', 'a specific date')
    tone = data.get('tone', 'inspiring')

    lead = _tone_lead(tone)
    ask = f"We're raising {target_amount:,} for {cause}."
    story = (
        f"{lead} call to action for {audience}: {ngo_name} is working to "
        f"create lasting change, and your support helps turn compassion into results."
    )
    steps = [
        'Share this campaign with your community.',
        'Donate what you can — every amount matters.',
        'Join a volunteer session and see impact firsthand.',
    ]

    return {
        'campaign': {
            'title': f"{ngo_name} — Donate for {cause}",
            'oneLiner': ask,
            'shortDescription': story,
            'keyBullets': steps,
            'deadline': deadline,
            'suggestedHashtags': _hashtags_for(cause, 10),
        },
        'posterText': {
            'headline': ngo_name,
            'subheadline': f"Together for {cause}",
            'body': f"Your donation creates real change. Donate before {deadline}.",
            'cta': 'Donate Now',
        },
    }


def generate_poster_and_caption(data: dict) -> dict:
    campaign_title = data['campaignTitle']
    cause = data['cause']
    key_message = data.get('keyMessage', 'Every contribution creates change.')
    ngo_name = data['ngoName']
    call_to_action = data.get('callToAction', 'Donate today')
    tone = data.get('tone', 'inspiring')

    lead = _tone_lead(tone)
    caption = f"{lead} — {ngo_name} is mobilizing support for {cause}. {key_message} {call_to_action}."

    return {
        'poster': {
            'headline': campaign_title,
            'subheadline': f"For {cause}",
            'body': key_message,
            'footer': f"Powered by community • {ngo_name}",
        },
        'socialCaption': caption,
        'suggestedHashtags': _hashtags_for(cause, 12),
    }


def awareness_suggestions(data: dict) -> dict:
    ngo_name = data['ngoName']
    topic = data['topic']
    audience = data.get('audience', 'students and local community')
    tone = data.get('tone', 'friendly')

    lead = _tone_lead(tone)
    suggestions = [
        {
            'name': 'Myth vs Fact Week',
            'idea': f'Post short "Myth vs Fact" cards about {topic} for {audience}.',
            'format': 'Carousel + reels',
            'samplePost': f'{ngo_name}: {lead} check-in on {topic}. Myth vs Fact today…',
        },
        {
            'name': 'Community Stories',
            'idea': f'Collect 5–10 local stories related to {topic} and publish weekly.',
            'format': 'Testimonial posts',
            'samplePost': f'Real voices. Real impact. {ngo_name} shares community stories about {topic}.',
        },
        {
            'name': 'Action Challenge (7 Days)',
            'idea': f'Challenge followers to take one small action daily for {topic}.',
            'format': 'Daily posts + CTA',
            'samplePost': f'Day 1 of the 7-day action challenge on {topic}. Join {ngo_name}!',
        },
    ]

    return {
        'topic': topic,
        'plan': suggestions,
        'tagline': f'{ngo_name} makes {topic} visible — and actionable.',
        'suggestedHashtags': _hashtags_for(topic, 12),
        'tone': tone,
    }


def social_media_content(data: dict) -> dict:
    ngo_name = data['ngoName']
    platform = data.get('platform', 'instagram')
    campaign_summary = data['campaignSummary']
    hashtags_count = data.get('hashtagsCount', 10)
    tone = data.get('tone', 'inspiring')

    lead = _tone_lead(tone)
    hashtags = _hashtags_for(campaign_summary, hashtags_count)
    base = f"{lead} update from {ngo_name}: {campaign_summary}"
    tags_str = ' '.join(hashtags)

    variants = {
        'instagram': {
            'caption': f"{base}\n\n✨ What you can do today:\n• Donate\n• Share\n• Volunteer\n\n{tags_str}",
            'suggestedCTA': 'Donate or volunteer now',
        },
        'facebook': {
            'caption': f"{base}\n\nYour support helps us move from ideas to outcomes.\n\n{tags_str}",
            'suggestedCTA': 'Support the campaign',
        },
        'twitter': {
            'caption': f"{base}\n\n{' '.join(hashtags[:5])}",
            'suggestedCTA': 'Reply with your support',
        },
        'linkedin': {
            'caption': f"{base}\n\nWe measure impact and keep you updated.\n\n{tags_str}",
            'suggestedCTA': 'Learn more',
        },
        'tiktok': {
            'caption': f"{base} (Part of a short series)\n\nFollow for daily impact updates!\n\n{' '.join(hashtags[:8])}",
            'suggestedCTA': 'Follow & share',
        },
    }

    v = variants.get(platform, variants['instagram'])
    return {'platform': platform, 'tone': tone, **v}


def chatbot_reply(data: dict) -> dict:
    ngo_name = data['ngoName']
    user_message = data['userMessage']
    context = data.get('context', '')
    msg = user_message.lower()
    base_context = f"Context: {context}\n" if context else ''

    intent = 'general'
    if any(w in msg for w in ('donat', 'fund')):
        intent = 'donation'
    if any(w in msg for w in ('volunt', 'join')):
        intent = 'volunteer'
    if any(w in msg for w in ('event', 'camp', 'meeting')):
        intent = 'event'
    if any(w in msg for w in ('campaign', 'awareness', 'spread')):
        intent = 'awareness'

    responses = {
        'donation': {
            'reply': (
                f"Thanks for reaching out. {ngo_name} relies on donations to fund "
                f"{context or 'community programs'}. If you'd like, share your target "
                f"(e.g., \"10,000 INR\") and we'll suggest a campaign style to match your goal."
            ),
            'quickActions': [
                'Generate a donation campaign',
                'Create a poster caption',
                'Share the campaign link',
            ],
        },
        'volunteer': {
            'reply': (
                f"Volunteers are the heart of {ngo_name}. Tell me your availability "
                f"(weekends/weekday) and skills (teaching, outreach, event support). "
                f"I'll suggest the best roles to start with."
            ),
            'quickActions': [
                'Create a volunteer plan',
                'Match skills to events',
                'Draft a volunteer call',
            ],
        },
        'event': {
            'reply': (
                f"I can help you organize events for {ngo_name}. What type of event "
                f"is it (clean-up, workshop, fundraiser) and what date/location are you targeting?"
            ),
            'quickActions': [
                'Draft an event description',
                'Generate promotion posts',
                'Plan an awareness mini-campaign',
            ],
        },
        'awareness': {
            'reply': (
                f"Let's spread awareness effectively. What topic do you want to focus on "
                f"(e.g., health, education, environment)? I'll propose a short awareness "
                f"plan + social post ideas."
            ),
            'quickActions': [
                'Generate awareness suggestions',
                'Create social media posts',
                'Suggest hashtags',
            ],
        },
        'general': {
            'reply': (
                f"{base_context}{ngo_name} chatbot here. Ask me about donations, events, "
                f"volunteer roles, or social media content generation for your cause."
            ),
            'quickActions': [
                'Donation campaign generator',
                'Event management ideas',
                'Poster + caption generation',
            ],
        },
    }

    return responses.get(intent, responses['general'])
