
    const $container = $('.container');
    const $studentsTableTbody = $('.studentsTable__tbody');
    const $addStudentForm = $('.addStudent__form'); 
    const $addStudentFormButton = $('.addStudent__form__button');
    const $pageSizeInput = $('#pageSize');  
    const $paginationContainer = $('#pagination');

    let students = JSON.parse(localStorage.getItem('students')) || [];
    let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;
    let pageSize = parseInt(localStorage.getItem('pageSize')) || 5;

    function renderStudents(studentsPage) {
        $studentsTableTbody.empty();

        $.each(studentsPage, function(index, student) {
            let $tr = $('<tr>').addClass('studentsTable__tr');

            $tr.append($('<td>').addClass('studentsTable__td').text(student.lastName));
            $tr.append($('<td>').addClass('studentsTable__td').text(student.firstName));
            $tr.append($('<td>').addClass('studentsTable__td').text(student.middleName));

            let date = new Date(student.dateOfBirth);
            let formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            $tr.append($('<td>').addClass('studentsTable__td').text(formattedDate));
            $tr.append($('<td>').addClass('studentsTable__td').text(student.group));
            $tr.append($('<td>').addClass('studentsTable__td').text(student.averageScore.toFixed(2)));

            let $delTd = $('<td>').addClass('studentsTable__td');
            let $delBtn = $('<button>').addClass('btn btn-danger delBtn').text('Удалить');

            $delBtn.on('click', function() {
                students.splice(index + (currentPage - 1) * pageSize, 1);
                updatePagination();
            });

            $delTd.append($delBtn);
            $tr.append($delTd);
            $studentsTableTbody.append($tr);
        });
    }

    function paginateStudents() {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, students.length);
        return students.slice(startIndex, endIndex);
    }

    function renderPaginationControls() {
        const totalPages = Math.ceil(students.length / pageSize);
        $paginationContainer.empty();

        let $paginationList = $('<ul>').addClass('pagination justify-content-center');

        let $prevButton = $('<li>').addClass(`page-item ${currentPage === 1 ? "disabled" : ""}`);
        let $prevLink = $('<a>').addClass('page-link').attr('href', '#').text('Предыдущая');
        $prevButton.append($prevLink).on('click', function() {
            if (currentPage > 1) {
                currentPage--;
                updatePagination();
            }
        });
        $paginationList.append($prevButton);

        for (let i = 1; i <= totalPages; i++) {
            let $pageItem = $('<li>').addClass(`page-item ${i === currentPage ? "active" : ""}`);
            let $pageLink = $('<a>').addClass('page-link').attr('href', '#').text(i);
            $pageLink.on('click', function() {
                currentPage = i;
                updatePagination();
            });
            $pageItem.append($pageLink);
            $paginationList.append($pageItem);
        }

        let $nextButton = $('<li>').addClass(`page-item ${currentPage === totalPages ? "disabled" : ""}`);
        let $nextLink = $('<a>').addClass('page-link').attr('href', '#').text('Следующая');
        $nextButton.append($nextLink).on('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                updatePagination();
            }
        });
        $paginationList.append($nextButton);

        $paginationContainer.append($paginationList);
    }

    function updatePagination() {
        const studentsPage = paginateStudents();
        renderStudents(studentsPage);
        renderPaginationControls();
        checkStudents();
        saveToLocalStorage();
    }

    function saveToLocalStorage() {
        localStorage.setItem('students', JSON.stringify(students));
        localStorage.setItem('currentPage', currentPage);
        localStorage.setItem('pageSize', pageSize);
    }

    function checkStudents() {
        const $noStudentsElement = $('.alert__noStudents');

        if (students.length > 0) {
            if ($noStudentsElement.length) {
                $noStudentsElement.remove();
            }
        } else {
            if (!$noStudentsElement.length) {
                let $noStudents = $('<h1>').addClass('alert__noStudents').text('Ни одного студента не найдено');
                $container.insertBefore($noStudents, $paginationContainer);
            }
        }
    }

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    $addStudentFormButton.on('click', function (event) {
        event.preventDefault();

        let formData = $addStudentForm.serializeArray();
        let firstName = formData.find(item => item.name === 'FirstName').value.trim();
        let lastName = formData.find(item => item.name === 'LastName').value.trim();
        let middleName = formData.find(item => item.name === 'MiddleName').value.trim();
        let dateOfBirthInput = formData.find(item => item.name === 'DateOfBirth').value;
        let group = formData.find(item => item.name === 'Group').value.trim();
        let averageScore = parseFloat(formData.find(item => item.name === 'AverageScore').value);

        if (!firstName || !lastName || !middleName || !dateOfBirthInput || !group || isNaN(averageScore)) {
            alert('Заполните все поля');
            return;
        }

        if (!/^[A-Za-zА-Яа-яЁё]+$/.test(firstName) || 
            !/^[A-Za-zА-Яа-яЁё]+$/.test(lastName) || 
            !/^[A-Za-zА-Яа-яЁё]+$/.test(middleName)) {
            alert('Имя, фамилия и отчество должны содержать только буквы');
            return;
        }

        let dateOfBirth = new Date(dateOfBirthInput);
        let minDate = new Date('1900-01-01');
        let maxDate = new Date('2010-01-01');

        if (dateOfBirth < minDate || dateOfBirth > maxDate) {
            alert('Дата рождения должна быть между 01.01.1900 и 01.01.2010');
            return;
        }
        if (averageScore < 2.00 || averageScore > 5.00) {
            alert('Средний балл должен быть в диапазоне от 2.00 до 5.00');
            return;
        }

        firstName = capitalize(firstName);
        lastName = capitalize(lastName);
        middleName = capitalize(middleName);

        let student = {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            dateOfBirth: dateOfBirth.toISOString(),
            group: group,
            averageScore: averageScore
        };

        students.push(student); 
        updatePagination();
        $addStudentForm[0].reset();
    });

    $pageSizeInput.on('change', function (event) {
        pageSize = parseInt($(this).val()) || 5; 
        currentPage = 1; 
        updatePagination(); 
    });

    updatePagination();

