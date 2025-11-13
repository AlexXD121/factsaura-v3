// Mock data for development when backend is not available
export const mockPosts = [
    {
        id: 1,
        title: "Breaking: Earthquake Alert System Malfunction Causes False Alarms",
        content: "Multiple cities received false earthquake warnings today due to a technical glitch in the emergency alert system. Officials confirm no seismic activity was detected.",
        post_type: "ai_detected",
        urgency_level: "high",
        is_misinformation: false,
        is_verified: true,
        confidence_score: 0.92,
        upvotes: 156,
        downvotes: 12,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source_url: "https://example.com/earthquake-alert",
        location_relevance: "California, USA",
        harm_category: "emergency_alert",
        crisis_keywords: ["earthquake", "false alarm", "emergency"],
        ai_analysis: "System malfunction confirmed by multiple official sources. No actual seismic activity detected.",
        analysis_explanation: "Cross-referenced with seismic monitoring stations and official emergency management sources. High confidence this is a verified technical issue, not misinformation.",
        red_flags: [],
        sources_needed: [],
        reasoning_steps: [
            "Checked official seismic monitoring data",
            "Verified with emergency management agencies",
            "Confirmed technical malfunction reports",
            "No contradictory evidence found"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.89
    },
    {
        id: 2,
        title: "Miracle Cure for COVID-19 Found in Kitchen Spice",
        content: "A viral social media post claims that turmeric mixed with honey can completely cure COVID-19 in 24 hours. The post has been shared over 50,000 times.",
        post_type: "ai_detected",
        urgency_level: "critical",
        is_misinformation: true,
        is_verified: false,
        confidence_score: 0.96,
        upvotes: 89,
        downvotes: 234,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        source_url: "https://example.com/fake-cure-post",
        location_relevance: "Global",
        harm_category: "medical_misinformation",
        crisis_keywords: ["COVID-19", "cure", "miracle", "turmeric"],
        ai_analysis: "MISINFORMATION DETECTED: No scientific evidence supports this claim. Could lead to dangerous self-medication.",
        analysis_explanation: "This claim contradicts established medical science and WHO guidelines. Turmeric has anti-inflammatory properties but cannot cure COVID-19. Spreading such claims can prevent people from seeking proper medical treatment.",
        red_flags: ["unverified_medical_claim", "miracle_cure_language", "no_scientific_source"],
        sources_needed: ["peer_reviewed_studies", "medical_authority_verification"],
        reasoning_steps: [
            "Analyzed claim against medical literature",
            "No peer-reviewed studies support this claim",
            "Contradicts WHO and CDC guidelines",
            "Pattern matches known medical misinformation"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.15
    },
    {
        id: 3,
        title: "Local Weather Service Issues Flood Warning for Downtown Area",
        content: "The National Weather Service has issued a flood warning for the downtown metropolitan area due to heavy rainfall expected over the next 48 hours. Residents are advised to avoid low-lying areas.",
        post_type: "user_submitted",
        urgency_level: "medium",
        is_misinformation: false,
        is_verified: true,
        confidence_score: 0.88,
        upvotes: 67,
        downvotes: 3,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        source_url: "https://weather.gov/flood-warning",
        location_relevance: "Metropolitan Area",
        harm_category: "weather_emergency",
        crisis_keywords: ["flood", "warning", "heavy rain"],
        ai_analysis: "Legitimate weather warning from official source. Information matches meteorological data.",
        analysis_explanation: "Verified against official National Weather Service data. Rainfall predictions and flood risk assessment are consistent with meteorological models.",
        red_flags: [],
        sources_needed: [],
        reasoning_steps: [
            "Verified source is official weather service",
            "Cross-checked with meteorological data",
            "Warning format matches official protocols",
            "No contradictory weather information found"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.94
    },
    {
        id: 4,
        title: "New Study Shows 5G Towers Cause Bird Deaths",
        content: "A recent study allegedly shows that 5G cell towers are causing mass bird deaths across the country. The study claims electromagnetic radiation is disrupting bird navigation systems.",
        post_type: "ai_detected",
        urgency_level: "medium",
        is_misinformation: true,
        is_verified: false,
        confidence_score: 0.87,
        upvotes: 23,
        downvotes: 156,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        source_url: "https://example.com/fake-5g-study",
        location_relevance: "United States",
        harm_category: "technology_misinformation",
        crisis_keywords: ["5G", "bird deaths", "electromagnetic"],
        ai_analysis: "MISINFORMATION DETECTED: No credible scientific study supports this claim. Likely based on debunked conspiracy theories.",
        analysis_explanation: "Extensive research by wildlife organizations and telecommunications regulators has found no evidence linking 5G technology to bird deaths. This appears to be recycled misinformation from earlier anti-5G campaigns.",
        red_flags: ["unverified_study", "conspiracy_theory_pattern", "no_peer_review"],
        sources_needed: ["peer_reviewed_research", "wildlife_authority_verification"],
        reasoning_steps: [
            "Searched for peer-reviewed studies on 5G and wildlife",
            "Found no credible evidence supporting the claim",
            "Identified pattern matching known 5G misinformation",
            "Verified with telecommunications safety research"
        ],
        uncertainty_flags: ["study_not_independently_verified"],
        community_trust_score: 0.22
    },
    {
        id: 5,
        title: "City Council Announces New Public Transportation Routes",
        content: "The city council has approved three new bus routes to improve connectivity between residential areas and the business district. The new routes will begin service next month.",
        post_type: "user_submitted",
        urgency_level: "low",
        is_misinformation: false,
        is_verified: true,
        confidence_score: 0.91,
        upvotes: 45,
        downvotes: 2,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        source_url: "https://city.gov/transportation-announcement",
        location_relevance: "City Center",
        harm_category: "general",
        crisis_keywords: [],
        ai_analysis: "Legitimate public announcement from official city government source.",
        analysis_explanation: "Information verified against official city council meeting minutes and transportation department announcements. Standard municipal communication format.",
        red_flags: [],
        sources_needed: [],
        reasoning_steps: [
            "Verified source is official city government",
            "Cross-checked with council meeting records",
            "Information format matches official announcements",
            "No contradictory information found"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.96
    },
    {
        id: 6,
        title: "BREAKING: Drinking Bleach Prevents All Viruses - Doctor Claims",
        content: "A viral TikTok video shows someone claiming to be a doctor recommending diluted bleach as a daily supplement to prevent all viral infections. The video has 2.3M views and counting.",
        post_type: "ai_detected",
        urgency_level: "critical",
        is_misinformation: true,
        is_verified: false,
        confidence_score: 0.99,
        upvotes: 12,
        downvotes: 487,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        source_url: "https://tiktok.com/fake-doctor-bleach",
        location_relevance: "Global",
        harm_category: "medical_misinformation",
        crisis_keywords: ["bleach", "doctor", "virus prevention", "supplement"],
        ai_analysis: "EXTREME DANGER: This is deadly misinformation. Bleach consumption can cause severe poisoning and death.",
        analysis_explanation: "Consuming bleach in any amount is extremely dangerous and potentially fatal. No legitimate medical professional would recommend this. This appears to be dangerous misinformation that could cause immediate harm.",
        red_flags: ["dangerous_medical_advice", "unverified_credentials", "life_threatening_content"],
        sources_needed: ["medical_authority_verification", "poison_control_warning"],
        reasoning_steps: [
            "Identified extremely dangerous medical advice",
            "Verified no legitimate medical support exists",
            "Cross-referenced with poison control guidelines",
            "Flagged for immediate removal and warning"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.03
    },
    {
        id: 7,
        title: "Local School District Implements New Safety Protocols",
        content: "Following recent safety assessments, the school district has updated visitor check-in procedures and enhanced security measures at all campuses. Parents will receive detailed information packets this week.",
        post_type: "user_submitted",
        urgency_level: "low",
        is_misinformation: false,
        is_verified: true,
        confidence_score: 0.94,
        upvotes: 78,
        downvotes: 5,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        source_url: "https://schooldistrict.edu/safety-update",
        location_relevance: "Local School District",
        harm_category: "general",
        crisis_keywords: ["safety", "security", "school"],
        ai_analysis: "Legitimate announcement from verified school district source.",
        analysis_explanation: "Standard safety protocol update from official school district communications. Information format and source verification confirm authenticity.",
        red_flags: [],
        sources_needed: [],
        reasoning_steps: [
            "Verified official school district source",
            "Standard safety communication format",
            "Cross-checked with district website",
            "No contradictory information found"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.92
    },
    {
        id: 8,
        title: "Scientists Discover Aliens Living in Ocean Depths",
        content: "A research team claims to have found evidence of extraterrestrial life forms in the Mariana Trench. The 'discovery' includes blurry photos of alleged alien structures and testimonials from anonymous researchers.",
        post_type: "ai_detected",
        urgency_level: "low",
        is_misinformation: true,
        is_verified: false,
        confidence_score: 0.93,
        upvotes: 34,
        downvotes: 189,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        source_url: "https://example.com/fake-alien-discovery",
        location_relevance: "Pacific Ocean",
        harm_category: "pseudoscience",
        crisis_keywords: ["aliens", "discovery", "scientists", "ocean"],
        ai_analysis: "MISINFORMATION DETECTED: No credible scientific evidence supports this extraordinary claim.",
        analysis_explanation: "Extraordinary claims require extraordinary evidence. No peer-reviewed research, official scientific institution backing, or verifiable researcher credentials support this claim. Pattern matches common pseudoscientific hoaxes.",
        red_flags: ["extraordinary_claim_no_evidence", "anonymous_sources", "blurry_photos", "no_peer_review"],
        sources_needed: ["peer_reviewed_research", "scientific_institution_verification"],
        reasoning_steps: [
            "Searched scientific databases for related research",
            "No credible scientific institutions report this discovery",
            "Anonymous sources reduce credibility significantly",
            "Pattern matches known pseudoscientific hoaxes"
        ],
        uncertainty_flags: ["requires_expert_marine_biology_review"],
        community_trust_score: 0.18
    },
    {
        id: 9,
        title: "Massive Earthquake Hits California - Tsunami Warning Issued",
        content: "URGENT: 8.5 magnitude earthquake struck Los Angeles 20 minutes ago. Tsunami warning for entire West Coast. Evacuate coastal areas immediately! Share to save lives!",
        post_type: "ai_detected",
        urgency_level: "critical",
        is_misinformation: true,
        is_verified: false,
        confidence_score: 0.98,
        upvotes: 8,
        downvotes: 312,
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        source_url: "https://twitter.com/fake-emergency-account",
        location_relevance: "California, USA",
        harm_category: "emergency_alert",
        crisis_keywords: ["earthquake", "tsunami", "evacuate", "urgent"],
        ai_analysis: "FALSE EMERGENCY: No seismic activity detected. This is dangerous misinformation that could cause panic.",
        analysis_explanation: "Cross-referenced with USGS earthquake monitoring systems, NOAA tsunami warning centers, and official emergency management agencies. No seismic activity or tsunami warnings have been issued. This false emergency alert could cause dangerous panic and evacuation chaos.",
        red_flags: ["false_emergency", "no_official_source", "panic_inducing", "share_to_save_lives_language"],
        sources_needed: ["official_emergency_verification", "seismic_monitoring_confirmation"],
        reasoning_steps: [
            "Checked USGS real-time earthquake monitoring",
            "Verified no tsunami warnings from NOAA",
            "Confirmed no official emergency alerts issued",
            "Identified as dangerous false emergency"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.05
    },
    {
        id: 10,
        title: "New Electric Vehicle Charging Stations Open Downtown",
        content: "The city has opened 12 new fast-charging stations for electric vehicles in the downtown parking district. The stations support all major EV brands and offer competitive pricing.",
        post_type: "user_submitted",
        urgency_level: "low",
        is_misinformation: false,
        is_verified: true,
        confidence_score: 0.89,
        upvotes: 92,
        downvotes: 7,
        created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
        source_url: "https://city.gov/ev-charging-stations",
        location_relevance: "Downtown District",
        harm_category: "general",
        crisis_keywords: [],
        ai_analysis: "Legitimate infrastructure announcement from official city source.",
        analysis_explanation: "Verified against city infrastructure development records and official announcements. Standard municipal infrastructure communication.",
        red_flags: [],
        sources_needed: [],
        reasoning_steps: [
            "Verified official city government source",
            "Cross-checked with infrastructure development plans",
            "Standard municipal announcement format",
            "No contradictory information found"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.91
    },
    {
        id: 11,
        title: "Vaccines Contain Microchips for Government Tracking",
        content: "Leaked documents allegedly show that COVID-19 vaccines contain microscopic tracking devices. The post includes 'evidence' from unnamed government whistleblowers and grainy microscope images.",
        post_type: "ai_detected",
        urgency_level: "high",
        is_misinformation: true,
        is_verified: false,
        confidence_score: 0.97,
        upvotes: 19,
        downvotes: 278,
        created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9 hours ago
        source_url: "https://example.com/vaccine-conspiracy",
        location_relevance: "Global",
        harm_category: "medical_misinformation",
        crisis_keywords: ["vaccines", "microchips", "tracking", "government"],
        ai_analysis: "MISINFORMATION DETECTED: Debunked conspiracy theory with no scientific basis.",
        analysis_explanation: "This is a well-documented conspiracy theory that has been thoroughly debunked by medical experts, fact-checkers, and vaccine manufacturers. Vaccine ingredients are publicly available and regulated by health authorities worldwide.",
        red_flags: ["conspiracy_theory", "unnamed_sources", "debunked_claim", "anti_vaccine_misinformation"],
        sources_needed: ["medical_authority_verification", "vaccine_ingredient_transparency"],
        reasoning_steps: [
            "Identified known vaccine conspiracy theory",
            "Cross-referenced with medical fact-checking databases",
            "Verified vaccine ingredients are publicly documented",
            "No credible evidence supports microchip claims"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.12
    },
    {
        id: 12,
        title: "Local Library Extends Hours for Exam Season",
        content: "The public library will extend operating hours until 10 PM Monday through Thursday during the next three weeks to accommodate students preparing for final exams.",
        post_type: "user_submitted",
        urgency_level: "low",
        is_misinformation: false,
        is_verified: true,
        confidence_score: 0.95,
        upvotes: 156,
        downvotes: 2,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        source_url: "https://library.gov/extended-hours",
        location_relevance: "Local Community",
        harm_category: "general",
        crisis_keywords: [],
        ai_analysis: "Legitimate public service announcement from official library source.",
        analysis_explanation: "Standard library service update from verified official source. Information format matches typical library communications.",
        red_flags: [],
        sources_needed: [],
        reasoning_steps: [
            "Verified official library source",
            "Standard service announcement format",
            "Cross-checked with library website",
            "No contradictory information found"
        ],
        uncertainty_flags: [],
        community_trust_score: 0.97
    }
];

export const mockPagination = {
    current_page: 1,
    total_pages: 3,
    total_posts: 12,
    posts_per_page: 8,
    has_more: true,
    next_page: 2,
    prev_page: null
};

export const mockFilters = {
    urgency_levels: ['low', 'medium', 'high', 'critical'],
    harm_categories: ['general', 'medical_misinformation', 'emergency_alert', 'weather_emergency', 'technology_misinformation', 'pseudoscience'],
    locations: ['Global', 'United States', 'California, USA', 'Metropolitan Area', 'City Center', 'Pacific Ocean', 'Local School District', 'Downtown District', 'Local Community']
};

// Function to simulate API delay
export const simulateDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockAPIResponse = {
    success: true,
    data: {
        posts: mockPosts,
        pagination: mockPagination,
        filters: mockFilters
    }
};