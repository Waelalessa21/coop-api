class WebApp {
    constructor() {
        this.submissionsData = null;
        this.opportunitiesData = null;
        this.currentTab = 'submissionsSection';
        this.init();
    }

    async init() {
        this.setupTabs();
        this.setupEventListeners();
        this.setupOpportunityForm();
        await Promise.all([this.loadSubmissions(), this.loadOpportunities()]);
    }

    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const target = button.dataset.target;
                if (this.currentTab === target) {
                    return;
                }

                this.currentTab = target;

                tabButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.target === target));
                tabContents.forEach((content) => {
                    content.classList.toggle('hidden', content.id !== target);
                });

                if (target === 'opportunitiesSection' && !this.opportunitiesData) {
                    this.loadOpportunities();
                }
            });
        });
    }

    async loadSubmissions() {
        try {
            const response = await fetch('/api/v1/submissions');
            if (!response.ok) {
                throw new Error('failed_to_fetch_submissions');
            }
            const submissions = await response.json();

            const dataMap = {};
            submissions.forEach((submission) => {
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

    async loadOpportunities() {
        try {
            const response = await fetch('/api/v1/opportunities');
            if (!response.ok) {
                throw new Error('failed_to_fetch_opportunities');
            }
            const opportunities = await response.json();

            const dataMap = {};
            opportunities.forEach((opportunity) => {
                dataMap[opportunity.id] = opportunity;
            });

            this.opportunitiesData = dataMap;
            this.renderOpportunities(opportunities);
        } catch (error) {
            console.error('Error loading opportunities:', error);
            document.getElementById('opportunitiesList').innerHTML =
                '<div class="loading">خطأ في تحميل المجالات</div>';
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

        container.innerHTML = submissions
            .map(
                (submission) => `
            <div class="submission-card" onclick="webApp.showSubmissionDetails('${submission.id}')">
                <div class="avatar">${submission.name.charAt(0).toUpperCase()}</div>
                <div class="submission-info">
                    <div class="submission-name">${submission.name}</div>
                    <div class="submission-major">${submission.major}</div>
                </div>
            </div>
        `
            )
            .join('');
    }

    renderOpportunities(opportunities) {
        const container = document.getElementById('opportunitiesList');

        if (!opportunities || opportunities.length === 0) {
            container.innerHTML = `
                <div class="no-submissions">
                    <img src="/static/assets/images/noRequest.png" alt="No opportunities" class="no-request-image">
                    <p class="no-submissions-text">لا توجد مجالات توظيف حالياً</p>
                </div>
            `;
            return;
        }

        container.innerHTML = opportunities
            .map(
                (opportunity) => `
            <div class="opportunity-card">
                <div class="opportunity-field">${opportunity.field}</div>
                <div class="opportunity-description">
                    <strong>تفاصيل المجال</strong>
                    <p>${opportunity.description}</p>
                </div>
                <div class="opportunity-tasks">
                    <strong>المهام المتوقعة</strong>
                    <p>${opportunity.expected_tasks}</p>
                </div>
                <div class="opportunity-meta">
                    <span>أضيف بتاريخ ${this.formatDate(opportunity.created_at)}</span>
                </div>
            </div>
        `
            )
            .join('');
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
            ${data.cvUrl
                ? `
                <div class="detail-item">
                    <div class="detail-label">السيرة الذاتية</div>
                    <a href="${data.cvUrl}" class="cv-link" target="_blank">عرض السيرة الذاتية</a>
                </div>
            `
                : ''}
        `;
    }

    setupEventListeners() {
        const closeModalButton = document.getElementById('closeModal');
        const submissionModal = document.getElementById('submissionModal');

        if (closeModalButton) {
            closeModalButton.onclick = () => {
                submissionModal.style.display = 'none';
            };
        }

        window.onclick = (event) => {
            if (event.target === submissionModal) {
                submissionModal.style.display = 'none';
            }
        };
    }

    setupOpportunityForm() {
        const form = document.getElementById('opportunityForm');
        const statusElement = document.getElementById('opportunityFormStatus');

        if (!form) {
            return;
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const payload = {
                field: formData.get('field')?.toString().trim() || '',
                description: formData.get('description')?.toString().trim() || '',
                expected_tasks: formData.get('expected_tasks')?.toString().trim() || '',
            };

            if (!payload.field || !payload.description || !payload.expected_tasks) {
                this.updateFormStatus(statusElement, 'يرجى تعبئة جميع الحقول', 'error');
                return;
            }

            this.updateFormStatus(statusElement, 'جاري الحفظ...', null);

            try {
                const response = await fetch('/api/v1/opportunities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorPayload = await response.json().catch(() => ({}));
                    throw new Error(errorPayload.detail || 'فشل حفظ المجال');
                }

                await this.loadOpportunities();
                form.reset();
                this.updateFormStatus(statusElement, 'تم حفظ المجال بنجاح', 'success');
            } catch (error) {
                console.error('Error creating opportunity:', error);
                this.updateFormStatus(statusElement, error.message || 'حدث خطأ غير متوقع', 'error');
            }
        });
    }

    updateFormStatus(element, message, statusClass) {
        if (!element) {
            return;
        }

        element.textContent = message || '';
        element.classList.remove('success', 'error');

        if (statusClass) {
            element.classList.add(statusClass);
        }
    }

    formatDate(dateString) {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'قيد المراجعة',
            approved: 'مقبول',
            rejected: 'مرفوض',
        };
        return statusMap[status] || status;
    }
}

const webApp = new WebApp();
