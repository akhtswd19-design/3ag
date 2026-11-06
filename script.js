const BOT_USERNAME = "Al3agle_bot";
const ADMIN_TELEGRAM_ID = "1056007305"; // معرف الأدمن الوحيد المطلوب حصرياً

let state = {
    onlineUsers: 14,
    activeCategory: "الكل",
    categories: ["الكل", "الحرس الملكي", "الحرس الوطني", "وزارة الدفاع", "الكلية الامنيه", "أخرى"],
    ads: [
        { id: 1, title: "متجر العاقل - خدمات وحلول متكاملة", link: "https://t.me/Al3agl_bot" },
        { id: 2, title: "انضم إلى قروب المناقشة الرسمي", link: "https://t.me/Q3skrr" }
    ],
    experiences: [
        {
            id: 101,
            gender: "ذكر",
            edu: "جامعي",
            status: "طالب بالكلية",
            year: "1447",
            category: "وزارة الدفاع",
            content: "أهرامات الجيزة تقع على هضبة الجيزة في محافظة الجيزة على الضفة الغربية لنهر النيل.",
            upvotes: 12,
            downvotes: 2,
            hidden: false
        }
    ],
    currentUser: null
};

document.addEventListener("DOMContentLoaded", () => {
    initStarsBg();
    renderCategories();
    renderAds();
    renderExperiences();
    initTelegramAuth();
});

function initStarsBg() {
    const container = document.getElementById('starsBg');
    for (let i = 0; i < 35; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 15 + 15}s`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(star);
    }
}

function switchTab(viewId, btnEl) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    btnEl.classList.add('active');
    document.querySelectorAll('.view-page').forEach(page => page.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategories() {
    const bar = document.getElementById('categoriesBar');
    const select = document.getElementById('fieldCategory');
    bar.innerHTML = '';
    select.innerHTML = '';

    state.categories.forEach(cat => {
        const chip = document.createElement('div');
        chip.className = `cat-chip ${cat === state.activeCategory ? 'active' : ''}`;
        chip.innerText = cat;
        chip.onclick = () => {
            state.activeCategory = cat;
            renderCategories();
            renderExperiences();
        };
        bar.appendChild(chip);

        if (cat !== "الكل") {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            select.appendChild(opt);
        }
    });
    renderAdminCats();
    renderAdminExperiences();
}

function renderAds() {
    const track = document.getElementById('carouselTrack');
    const dots = document.getElementById('carouselDots');
    track.innerHTML = '';
    dots.innerHTML = '';

    state.ads.forEach((ad, index) => {
        const slide = document.createElement('div');
        slide.className = 'banner-slide';
        slide.innerHTML = `<h4>${ad.title}</h4>`;
        if (ad.link) {
            slide.onclick = () => window.open(ad.link, '_blank');
            slide.style.cursor = 'pointer';
        }
        track.appendChild(slide);

        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dots.appendChild(dot);
    });
}

function renderExperiences() {
    const feed = document.getElementById('experiencesFeed');
    feed.innerHTML = '';

    let filtered = state.experiences.filter(item => !item.hidden);
    if (state.activeCategory !== "الكل") {
        filtered = filtered.filter(item => item.category === state.activeCategory);
    }

    filtered.forEach(item => {
        const total = item.upvotes + item.downvotes;
        item.accuracy = total === 0 ? 50 : Math.round((item.upvotes / total) * 100);
    });

    filtered.sort((a, b) => b.accuracy - a.accuracy);

    filtered.forEach(exp => {
        const card = document.createElement('div');
        card.className = 'exp-card';
        card.innerHTML = `
            <div class="exp-header-tags">
                <span class="tag-item">${exp.gender}</span>
                <span class="tag-item">${exp.category}</span>
                <span class="tag-item">سنة ${exp.year}</span>
                <span class="tag-item">${exp.status}</span>
                <span class="tag-item">${exp.edu}</span>
            </div>
            <div class="exp-content-body">${exp.content}</div>
            <div class="exp-footer-actions">
                <div class="vote-controls">
                    <button class="vote-btn up ${exp.userVoted === 'up' ? 'voted' : ''}" onclick="vote(${exp.id}, 'up')">
                        <svg viewBox="0 0 24 24"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
                    </button>
                    <button class="vote-btn down ${exp.userVoted === 'down' ? 'voted' : ''}" onclick="vote(${exp.id}, 'down')">
                        <svg viewBox="0 0 24 24"><path d="M12 20l8-8h-5V4h-6v8H4z"/></svg>
                    </button>
                    <span class="percentage-badge">نسبة الصحة: <strong>${exp.accuracy}%</strong></span>
                </div>
                <button class="share-btn" onclick="shareExperience(${exp.id})" title="مشاركة">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                </button>
            </div>
            <div class="disclaimer-text">التجربه من شخص مو من فريق العمل</div>
        `;
        feed.appendChild(card);
    });
}

function vote(expId, type) {
    const item = state.experiences.find(e => e.id === expId);
    if (!item) return;

    if (item.userVoted === type) {
        if (type === 'up') item.upvotes--;
        else item.downvotes--;
        item.userVoted = null;
    } else {
        if (item.userVoted === 'up') item.upvotes--;
        if (item.userVoted === 'down') item.downvotes--;
        if (type === 'up') item.upvotes++;
        else item.downvotes++;
        item.userVoted = type;
    }
    renderExperiences();
}

function shareExperience(expId) {
    const url = `${window.location.origin}${window.location.pathname}?exp=${expId}`;
    if (navigator.share) {
        navigator.share({ title: 'تجارب العاقل', text: 'شاهد هذه التجربة:', url: url });
    } else {
        navigator.clipboard.writeText(url);
        alert('تم نسخ رابط التجربة للحافظة!');
    }
}

function createNewExperience() {
    const content = document.getElementById('fieldContent').value.trim();
    if (!content) {
        alert('يرجى كتابة نص التجربة أولاً.');
        return;
    }

    const newExp = {
        id: Date.now(),
        gender: document.getElementById('fieldGender').value,
        edu: document.getElementById('fieldEdu').value,
        status: document.getElementById('fieldStatus').value,
        year: document.getElementById('fieldYear').value,
        category: document.getElementById('fieldCategory').value,
        content: content,
        upvotes: 1,
        downvotes: 0,
        hidden: false
    };

    state.experiences.unshift(newExp);
    document.getElementById('fieldContent').value = '';
    alert('تم إرسال تجربتك بنجاح!');
    switchTab('viewHome', document.querySelectorAll('.nav-item')[0]);
    renderExperiences();
}

function initTelegramAuth() {
    const container = document.getElementById('telegramWidgetContainer');
    if (!container) return;
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", BOT_USERNAME);
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    container.appendChild(script);
}

// دالة تسجيل الدخول والتحقق الصارم من اليوزر آيدي للأدمن
function onTelegramAuth(user) {
    state.currentUser = user;
    document.getElementById('telegramWidgetContainer').style.display = 'none';
    const profile = document.getElementById('userProfileDisplay');
    profile.style.display = 'block';
    profile.innerHTML = `مرحباً، ${user.first_name} ${user.username ? '(@' + user.username + ')' : ''}`;

    // التحقق الحصري لمعرف الأدمن المطلوب
    if (String(user.id) === ADMIN_TELEGRAM_ID) {
        document.getElementById('adminBtn').style.display = 'inline-block';
    } else {
        document.getElementById('adminBtn').style.display = 'none';
    }
}

function openAdminModal() { document.getElementById('adminModal').classList.add('active'); }
function closeAdminModal() { document.getElementById('adminModal').classList.remove('active'); }

function renderAdminCats() {
    const list = document.getElementById('adminCatsList');
    if (!list) return;
    list.innerHTML = '';
    state.categories.forEach(cat => {
        if (cat === "الكل") return;
        const tag = document.createElement('div');
        tag.className = 'admin-tag';
        tag.innerHTML = `${cat} <span onclick="removeCategory('${cat}')">×</span>`;
        list.appendChild(tag);
    });
}

function renderAdminExperiences() {
    const list = document.getElementById('adminExperiencesList');
    if (!list) return;
    list.innerHTML = '';
    state.experiences.forEach(exp => {
        const row = document.createElement('div');
        row.className = 'admin-exp-row';
        row.innerHTML = `
            <span style="max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${exp.content}</span>
            <div>
                <button onclick="toggleHideExp(${exp.id})" style="color:var(--gold-light); margin-left:8px;">${exp.hidden ? 'إظهار' : 'إخفاء'}</button>
                <button onclick="deleteExp(${exp.id})">حذف</button>
            </div>
        `;
        list.appendChild(row);
    });
}

function addAdminCategory() {
    const val = document.getElementById('adminCatInput').value.trim();
    if (val && !state.categories.includes(val)) {
        state.categories.push(val);
        document.getElementById('adminCatInput').value = '';
        renderCategories();
    }
}

function removeCategory(cat) {
    state.categories = state.categories.filter(c => c !== cat);
    renderCategories();
}

function addAdminAd() {
    const text = document.getElementById('adminAdText').value.trim();
    const link = document.getElementById('adminAdLink').value.trim();
    if (text) {
        state.ads.push({ id: Date.now(), title: text, link: link });
        document.getElementById('adminAdText').value = '';
        document.getElementById('adminAdLink').value = '';
        renderAds();
        alert('تم إضافة الإعلان بنجاح');
    }
}

function toggleHideExp(id) {
    const exp = state.experiences.find(e => e.id === id);
    if (exp) {
        exp.hidden = !exp.hidden;
        renderExperiences();
        renderAdminExperiences();
    }
}

function deleteExp(id) {
    state.experiences = state.experiences.filter(e => e.id !== id);
    renderExperiences();
    renderAdminExperiences();
}

function updateOnlineCount() {
    const val = document.getElementById('adminOnlineInput').value;
    if (val) {
        document.getElementById('onlineCount').innerText = val;
        alert('تم تحديث عدد المتصلين');
        closeAdminModal();
    }
}
