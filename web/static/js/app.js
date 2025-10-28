class WebApp {
    constructor() {
        this.submissionsData = null;
        this.init();
    }

    async init() {
        await this.loadSubmissions();
        this.setupEventListeners();
    }

    async loadSubmissions() {
        try {
            const response = await fetch('/api/v1/submissions');
            const submissions = await response.json();
            
            const dataMap = {};
            submissions.forEach(submission => {
                dataMap[submission.id] = submission;
            });
            
            this.submissionsData = dataMap;
            this.renderSubmissions(submissions);
        } catch (error) {
            console.error('Error loading submissions:', error);
            document.getElementById('submissionsList').innerHTML = 
                '<div class="loading">خطأ في تحميل البيانات</div>';
        }
    }

    renderSubmissions(submissions) {
        const container = document.getElementById('submissionsList');
        
        if (submissions.length === 0) {
            container.innerHTML = `
                <div class="no-submissions">
                    <img src="/static/assets/images/noRequest.png" alt="No requests" class="no-request-image">
                    <p class="no-submissions-text">لا يوجــد طــلبات تقديم حتى الان</p>
                </div>
            `;
            return;
        }

        container.innerHTML = submissions.map(submission => `
            <div class="submission-card" onclick="webApp.showSubmissionDetails('${submission.id}')">
                <div class="avatar">${submission.name.charAt(0).toUpperCase()}</div>
                <div class="submission-info">
                    <div class="submission-name">${submission.name}</div>
                    <div class="submission-major">${submission.major}</div>
                </div>
            </div>
        `).join('');
    }

    async showSubmissionDetails(submissionId) {
        try {
            const response = await fetch(`/api/v1/submissions/${submissionId}`);
            const submission = await response.json();
            
            this.renderSubmissionDetails(submission);
            document.getElementById('submissionModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading submission details:', error);
        }
    }

    renderSubmissionDetails(submission) {
        const container = document.getElementById('submissionDetails');
        const data = submission.data || submission;
        
        container.innerHTML = `
            <h2>تفاصيل المتقدم</h2>
            <div class="detail-item">
                <div class="detail-label">الاسم</div>
                <div class="detail-value">${data.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">البريد الإلكتروني</div>
                <div class="detail-value">${data.email}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${data.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">التخصص</div>
                <div class="detail-value">${data.major}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">معلومات إضافية</div>
                <div class="detail-value">${data.additional || 'لا توجد'}</div>
            </div>
            ${data.cvUrl ? `
                <div class="detail-item">
                    <div class="detail-label">السيرة الذاتية</div>
                    <a href="${data.cvUrl}" class="cv-link" target="_blank">عرض السيرة الذاتية</a>
                </div>
            ` : ''}
        `;
    }

    setupEventListeners() {
        document.getElementById('closeModal').onclick = () => {
            document.getElementById('submissionModal').style.display = 'none';
        };

        window.onclick = (event) => {
            const modal = document.getElementById('submissionModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'قيد المراجعة',
            'approved': 'مقبول',
            'rejected': 'مرفوض'
        };
        return statusMap[status] || status;
    }
}

const webApp = new WebApp();
