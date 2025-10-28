const API_BASE_URL = 'http://localhost:8000/api/v1';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('coopForm');
    const submitBtn = document.getElementById('submitBtn');
    const loaderOverlay = document.getElementById('loaderOverlay');
    const coopOverlay = document.getElementById('coopOverlay');
    const coopClose = document.getElementById('coopClose');
    const coopGotIt = document.getElementById('coopGotIt');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        showLoader();
        
        try {
            const formData = await prepareFormData();
            const response = await fetch(`${API_BASE_URL}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Submission successful:', result);
                showSuccessMessage();
            } else {
                const error = await response.json();
                console.error('Submission failed:', error);
                showErrorMessage(error.detail || 'حدث خطأ أثناء الإرسال');
            }
        } catch (error) {
            console.error('Network error:', error);
            showErrorMessage('خطأ في الاتصال بالخادم');
        } finally {
            hideLoader();
        }
    });

    async function prepareFormData() {
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const major = document.getElementById('major').value;
        const cvFile = document.getElementById('cv').files[0];
        const additional = document.getElementById('additional').value;

        const cvMetadata = await uploadFile(cvFile);

        return {
            personalInfo: {
                firstName: "مقدم الطلب",
                lastName: "للتعاون",
                email: email,
                phone: phone,
                address: "غير محدد",
                city: "غير محدد",
                state: "غير محدد",
                zipCode: "00000",
                country: "السعودية"
            },
            businessInfo: {
                businessName: "طلب تعاون",
                businessType: "تعاون",
                industry: major,
                yearsInBusiness: 0,
                numberOfEmployees: 1,
                annualRevenue: 0,
                businessAddress: "غير محدد",
                businessCity: "غير محدد",
                businessState: "غير محدد",
                businessZipCode: "00000",
                businessCountry: "السعودية",
                website: null,
                taxId: null
            },
            financialInfo: {
                requestedAmount: 0,
                loanPurpose: "طلب تعاون",
                collateralDescription: null,
                existingDebts: 0,
                monthlyIncome: 0,
                creditScore: null
            },
            documents: [cvMetadata],
            additionalInfo: additional
        };
    }

    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: result.url
                };
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            console.error('File upload error:', error);
            return {
                name: file.name,
                size: file.size,
                type: file.type,
                url: 'local-file'
            };
        }
    }

    function validateForm() {
        let isValid = true;
        
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const major = document.getElementById('major').value;
        const cvFile = document.getElementById('cv').files[0];

        if (!email || !isValidEmail(email)) {
            showError('emailError', 'البريد الإلكتروني غير صحيح');
            isValid = false;
        } else {
            hideError('emailError');
        }

        if (!phone || !isValidPhone(phone)) {
            showError('phoneError', 'رقم الهاتف غير صحيح');
            isValid = false;
        } else {
            hideError('phoneError');
        }

        if (!major.trim()) {
            showError('majorError', 'التخصص مطلوب');
            isValid = false;
        } else {
            hideError('majorError');
        }

        if (!cvFile) {
            showError('cvError', 'السيرة الذاتية مطلوبة');
            isValid = false;
        } else {
            hideError('cvError');
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^05\d{8}$/;
        return phoneRegex.test(phone);
    }

    function showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError(errorId) {
        const errorElement = document.getElementById(errorId);
        errorElement.style.display = 'none';
    }

    function showLoader() {
        loaderOverlay.style.display = 'flex';
        submitBtn.disabled = true;
    }

    function hideLoader() {
        loaderOverlay.style.display = 'none';
        submitBtn.disabled = false;
    }

    function showSuccessMessage() {
        coopOverlay.style.display = 'flex';
    }

    function showErrorMessage(message) {
        alert('خطأ: ' + message);
    }

    coopClose.addEventListener('click', function() {
        coopOverlay.style.display = 'none';
        form.reset();
    });

    coopGotIt.addEventListener('click', function() {
        coopOverlay.style.display = 'none';
        form.reset();
        window.location.href = '/';
    });
});



