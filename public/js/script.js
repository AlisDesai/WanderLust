document.addEventListener("DOMContentLoaded", function () {
    'use strict';

    var forms = document.querySelectorAll('.needs-validation');

    Array.prototype.forEach.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
});
