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
            const response = await fetch('../../data/submissions.json');
            const data = await response.json();
            
            const submissions = Object.entries(data).map(([id, submission]) => ({
                id,
                name: submission.name,
                email: submission.email,
                phone: submission.phone,
                major: submission.major,
                submissionDate: submission.submissionDate,
                status: submission.status,
                cvUrl: submission.cvUrl,
                additional: submission.additional
            }));
            
            this.submissionsData = data;
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
            container.innerHTML = '<div class="loading">لا توجد طلبات</div>';
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

    showSubmissionDetails(submissionId) {
        const submission = this.submissionsData[submissionId];
        
        if (!submission) {
            console.error('Submission not found');
            return;
        }
        
        this.renderSubmissionDetails(submission);
        document.getElementById('submissionModal').style.display = 'block';
    }

    renderSubmissionDetails(submission) {
        const container = document.getElementById('submissionDetails');
        
        container.innerHTML = `
            <h2>تفاصيل المتقدم</h2>
            <div class="detail-item">
                <div class="detail-label">الاسم</div>
                <div class="detail-value">${submission.name}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">البريد الإلكتروني</div>
                <div class="detail-value">${submission.email}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">رقم الهاتف</div>
                <div class="detail-value">${submission.phone}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">التخصص</div>
                <div class="detail-value">${submission.major}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">معلومات إضافية</div>
                <div class="detail-value">${submission.additional || 'لا توجد'}</div>
            </div>
            ${submission.cvUrl ? `
                <div class="detail-item">
                    <div class="detail-label">السيرة الذاتية</div>
                    <a href="../../${submission.cvUrl}" class="cv-link" target="_blank">عرض السيرة الذاتية</a>
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
