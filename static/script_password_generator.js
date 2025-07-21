document.addEventListener('DOMContentLoaded', function () {
    const generatedPasswordElem = document.getElementById('generated-password');
    const copyPasswordBtn = document.getElementById('copy-password-btn');
    const passwordLengthElem = document.getElementById('password-length');
    const lengthValueElem = document.getElementById('length-value');
    const includeUppercaseElem = document.getElementById('include-uppercase');
    const includeLowercaseElem = document.getElementById('include-lowercase');
    const includeNumbersElem = document.getElementById('include-numbers');
    const includeSymbolsElem = document.getElementById('include-symbols');
    const excludeAmbiguousElem = document.getElementById('exclude-ambiguous');
    const generateBtn = document.getElementById('generate-btn');

    const strengthBarElem = document.getElementById('strength-bar');
    const strengthTextElem = document.getElementById('strength-text');

    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:',.<>/?`~";
    const ambiguousChars = "Il1O0o"; // Chars to potentially exclude

    function updateLengthValue() {
        lengthValueElem.textContent = passwordLengthElem.value;
    }

    function generatePassword() {
        const length = parseInt(passwordLengthElem.value);
        let charset = "";
        let guaranteedChars = ""; // To ensure at least one of each selected type

        if (includeUppercaseElem.checked) {
            charset += uppercaseChars;
            guaranteedChars += getRandomChar(uppercaseChars);
        }
        if (includeLowercaseElem.checked) {
            charset += lowercaseChars;
            guaranteedChars += getRandomChar(lowercaseChars);
        }
        if (includeNumbersElem.checked) {
            charset += numberChars;
            guaranteedChars += getRandomChar(numberChars);
        }
        if (includeSymbolsElem.checked) {
            charset += symbolChars;
            guaranteedChars += getRandomChar(symbolChars);
        }

        if (charset === "") {
            generatedPasswordElem.value = "Select options!";
            updateStrengthIndicator(0); // No options, no strength
            return;
        }

        if (excludeAmbiguousElem.checked) {
            charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
            // Re-evaluate guaranteedChars if ambiguity exclusion removed a selected char type's only option
            // This is a simplification; a more robust approach would re-pick if necessary.
             guaranteedChars = guaranteedChars.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }
        
        if (charset === "") { // If excluding ambiguous chars removed everything
            generatedPasswordElem.value = "Too restrictive!";
            updateStrengthIndicator(0);
            return;
        }


        let password = guaranteedChars;
        const remainingLength = length - password.length;

        // Ensure we don't try to generate negative length if guaranteed chars exceed desired length
        if (remainingLength < 0) {
            // If too many required types for the short length, just pick from the guaranteed set
            password = shuffleString(guaranteedChars).substring(0, length);
        } else {
            for (let i = 0; i < remainingLength; i++) {
                password += getRandomChar(charset);
            }
            password = shuffleString(password); // Shuffle to mix guaranteed chars
        }
        

        generatedPasswordElem.value = password;
        updateStrengthIndicator(calculatePasswordStrength(password));
    }

    function getRandomChar(str) {
        if (!str) return '';
        const randomIndex = Math.floor(Math.random() * str.length);
        return str[randomIndex];
    }

    function shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap
        }
        return arr.join('');
    }

    function calculatePasswordStrength(password) {
        if (!password) return 0;
        let score = 0;
        const length = password.length;

        // Base score on length
        if (length >= 8) score += 25;
        if (length >= 12) score += 25;
        if (length >= 16) score += 15; // Bonus for very long

        // Character type variety
        if (/[A-Z]/.test(password)) score += 10;
        if (/[a-z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 15; // Symbols get a bit more

        return Math.min(score, 100); // Cap at 100
    }

    function updateStrengthIndicator(score) {
        let strengthLabel = 'Very Weak';
        let barColor = '#d32f2f'; // Red

        if (score >= 90) {
            strengthLabel = 'Very Strong';
            barColor = '#28a745'; // Dark Green
        } else if (score >= 75) {
            strengthLabel = 'Strong';
            barColor = '#4CAF50'; // Green
        } else if (score >= 50) {
            strengthLabel = 'Medium';
            barColor = '#ffc107'; // Yellow
        } else if (score >= 25) {
            strengthLabel = 'Weak';
            barColor = '#fd7e14'; // Orange
        }
        
        if (generatedPasswordElem.value === "Select options!" || generatedPasswordElem.value === "Too restrictive!" || !generatedPasswordElem.value) {
            strengthLabel = '';
            barColor = '#202225'; // Default track color
        }


        strengthBarElem.style.backgroundColor = barColor;
        strengthTextElem.textContent = strengthLabel;
        strengthTextElem.style.color = barColor === '#202225' ? '#707070' : barColor;
    }


    function copyPassword() {
        if (!generatedPasswordElem.value || generatedPasswordElem.value === "Select options!" || generatedPasswordElem.value === "Too restrictive!") return;

        generatedPasswordElem.select();
        generatedPasswordElem.setSelectionRange(0, 99999); // For mobile

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(generatedPasswordElem.value).then(() => {
                    // Visually indicate copy (e.g., change button text or icon briefly)
                    const originalIcon = copyPasswordBtn.innerHTML;
                    copyPasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`; // Checkmark
                    setTimeout(() => { copyPasswordBtn.innerHTML = originalIcon; }, 1500);
                }).catch(err => {
                    console.warn('Async clipboard copy failed:', err);
                    legacyCopy();
                });
            } else {
                legacyCopy();
            }
        } catch (err) {
            alert('Failed to copy password. Please copy manually.');
        }
    }

    function legacyCopy() {
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                 const originalIcon = copyPasswordBtn.innerHTML;
                 copyPasswordBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
                 setTimeout(() => { copyPasswordBtn.innerHTML = originalIcon; }, 1500);
            } else {
                throw new Error('Legacy copy command failed.');
            }
        } catch(err){
             alert('Failed to copy password using legacy method. Please copy manually.');
        }
    }

    // Event Listeners
    passwordLengthElem.addEventListener('input', updateLengthValue);
    generateBtn.addEventListener('click', generatePassword);
    copyPasswordBtn.addEventListener('click', copyPassword);

    // Initial setup
    updateLengthValue();
    generatePassword(); // Generate a password on load
});