// ================================
// EXAM COPY CHECKING SYSTEM
// ================================

let records = JSON.parse(
    localStorage.getItem("examRecords")
) || [];


// DOM ELEMENTS

const marksContainer = document.getElementById("questions");

const totalMarks = document.getElementById("totalMarks");
const percentage = document.getElementById("percentage");
const grade = document.getElementById("grade");
const status = document.getElementById("status");
const resultMessage = document.getElementById("resultMessage");

const recordsTable = document.getElementById("recordsTable");
const emptyMessage = document.getElementById("emptyMessage");


// ================================
// CALCULATE RESULT
// ================================

function calculateResult() {

    const markInputs =
        document.querySelectorAll(".marks");

    let total = 0;
    let maximum = 0;

    markInputs.forEach(input => {

        let value = Number(input.value) || 0;
        let max = Number(input.max) || 10;

        if (value > max) {
            input.value = max;
            value = max;
        }

        if (value < 0) {
            input.value = 0;
            value = 0;
        }

        total += value;
        maximum += max;

    });


    const percent =
        maximum === 0
            ? 0
            : (total / maximum) * 100;


    let finalGrade = "-";

    if (percent >= 90) {
        finalGrade = "A+";
    } else if (percent >= 80) {
        finalGrade = "A";
    } else if (percent >= 70) {
        finalGrade = "B+";
    } else if (percent >= 60) {
        finalGrade = "B";
    } else if (percent >= 50) {
        finalGrade = "C";
    } else if (percent >= 40) {
        finalGrade = "D";
    } else {
        finalGrade = "F";
    }


    const finalStatus =
        percent >= 40
            ? "PASS"
            : "FAIL";


    totalMarks.textContent =
        `${total} / ${maximum}`;

    percentage.textContent =
        `${percent.toFixed(1)}%`;

    grade.textContent =
        finalGrade;

    status.textContent =
        finalStatus;


    if (percent >= 40) {

        status.style.color = "#4ade80";

        resultMessage.textContent =
            "Excellent! The student has successfully cleared the examination.";

    } else {

        status.style.color = "#f87171";

        resultMessage.textContent =
            "The student has not achieved the minimum passing percentage.";

    }


    return {
        total,
        maximum,
        percent,
        finalGrade,
        finalStatus
    };
}


// ================================
// ADD MARK LISTENER
// ================================

document.addEventListener("input", function(e) {

    if (e.target.classList.contains("marks")) {
        calculateResult();
    }

});


// ================================
// ADD QUESTION
// ================================

document
    .getElementById("addQuestion")
    .addEventListener("click", () => {

        const questionCount =
            document.querySelectorAll(".question-row").length + 1;


        const row =
            document.createElement("div");

        row.className =
            "question-row";


        row.innerHTML = `

            <div class="question-number">
                Q${questionCount}
            </div>

            <input
                type="number"
                class="marks"
                min="0"
                max="10"
                placeholder="Marks">

            <span>/ 10</span>

        `;


        marksContainer.appendChild(row);

        calculateResult();

    });


// ================================
// SAVE RESULT
// ================================

document
    .getElementById("saveResult")
    .addEventListener("click", () => {

        const studentName =
            document.getElementById("studentName").value.trim();

        const rollNumber =
            document.getElementById("rollNumber").value.trim();

        const subject =
            document.getElementById("subject").value.trim();

        const examType =
            document.getElementById("examType").value;

        const remarks =
            document.getElementById("remarks").value.trim();


        if (
            !studentName ||
            !rollNumber ||
            !subject ||
            !examType
        ) {

            showToast(
                "Please fill all student details!",
                "error"
            );

            return;
        }


        const result =
            calculateResult();


        const record = {

            id: Date.now(),

            studentName,

            rollNumber,

            subject,

            examType,

            remarks,

            total: result.total,

            maximum: result.maximum,

            percentage:
                result.percent.toFixed(1),

            grade:
                result.finalGrade,

            status:
                result.finalStatus

        };


        records.push(record);


        localStorage.setItem(
            "examRecords",
            JSON.stringify(records)
        );


        renderRecords();

        updateDashboard();

        showToast(
            "Evaluation saved successfully!"
        );


        document
            .getElementById("studentName")
            .value = "";

        document
            .getElementById("rollNumber")
            .value = "";

        document
            .getElementById("remarks")
            .value = "";

    });


// ================================
// RENDER RECORDS
// ================================

function renderRecords(search = "") {

    recordsTable.innerHTML = "";


    const filteredRecords =
        records.filter(record =>
            record.studentName
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            record.rollNumber
                .toLowerCase()
                .includes(search.toLowerCase())
        );


    if (filteredRecords.length === 0) {

        emptyMessage.style.display =
            "block";

        return;

    }


    emptyMessage.style.display =
        "none";


    filteredRecords.forEach(record => {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${record.studentName}
                </strong>
            </td>

            <td>
                ${record.rollNumber}
            </td>

            <td>
                ${record.subject}
            </td>

            <td>
                ${record.total} / ${record.maximum}
            </td>

            <td>
                ${record.percentage}%
            </td>

            <td>
                <strong>
                    ${record.grade}
                </strong>
            </td>

            <td>

                <span class="status ${
                    record.status === "PASS"
                        ? "pass"
                        : "fail"
                }">

                    ${record.status}

                </span>

            </td>

            <td>

                <button
                    class="print-btn"
                    onclick="printResult(${record.id})">

                    <i class="fa-solid fa-print"></i>

                </button>


                <button
                    class="delete-btn"
                    onclick="deleteRecord(${record.id})">

                    <i class="fa-solid fa-trash"></i>

                </button>

            </td>

        `;


        recordsTable.appendChild(row);

    });

}


// ================================
// DELETE RECORD
// ================================

function deleteRecord(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this evaluation?"
        );


    if (!confirmDelete) return;


    records =
        records.filter(record =>
            record.id !== id
        );


    localStorage.setItem(
        "examRecords",
        JSON.stringify(records)
    );


    renderRecords();

    updateDashboard();

    showToast(
        "Record deleted successfully!"
    );

}


// ================================
// SEARCH
// ================================

document
    .getElementById("searchInput")
    .addEventListener("input", function() {

        renderRecords(this.value);

    });


// ================================
// DASHBOARD
// ================================

function updateDashboard() {

    const total =
        records.length;


    const passed =
        records.filter(
            record =>
                record.status === "PASS"
        ).length;


    const failed =
        records.filter(
            record =>
                record.status === "FAIL"
        ).length;


    const average =
        total === 0
            ? 0
            : records.reduce(
                (sum, record) =>
                    sum + Number(record.percentage),
                0
            ) / total;


    document
        .getElementById("totalStudents")
        .textContent = total;


    document
        .getElementById("passedStudents")
        .textContent = passed;


    document
        .getElementById("failedStudents")
        .textContent = failed;


    document
        .getElementById("averageMarks")
        .textContent =
            `${average.toFixed(1)}%`;

}


// ================================
// TOAST
// ================================

function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.style.background =
        type === "error"
            ? "#dc2626"
            : "#16a34a";


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ================================
// DARK MODE
// ================================

document
    .getElementById("themeBtn")
    .addEventListener("click", () => {

        document
            .body
            .classList
            .toggle("dark");


        const icon =
            document.querySelector(
                "#themeBtn i"
            );


        if (
            document.body.classList.contains("dark")
        ) {

            icon.className =
                "fa-solid fa-sun";

        } else {

            icon.className =
                "fa-solid fa-moon";

        }

    });


// ================================
// PRINT RESULT
// ================================

function printResult(id) {

    const record =
        records.find(
            record => record.id === id
        );


    if (!record) return;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=800,height=700"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>Exam Result</title>

            <style>

                body {
                    font-family: Arial;
                    padding: 50px;
                    color: #172033;
                }

                .header {
                    text-align: center;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }

                h1 {
                    color: #2563eb;
                }

                .student {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .box {
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    padding: 15px;
                    border: 1px solid #ddd;
                    text-align: left;
                }

                th {
                    background: #eff6ff;
                }

                .result {
                    margin-top: 30px;
                    padding: 20px;
                    background: #f8fafc;
                    border-radius: 10px;
                }

                .pass {
                    color: green;
                    font-weight: bold;
                }

                .fail {
                    color: red;
                    font-weight: bold;
                }

                .signature {
                    margin-top: 80px;
                    display: flex;
                    justify-content: space-between;
                }

            </style>

        </head>

        <body>

            <div class="header">

                <h1>EXAMINATION RESULT</h1>

                <p>
                    Professional Copy Checking System
                </p>

            </div>


            <div class="student">

                <div class="box">
                    <strong>Student Name:</strong><br>
                    ${record.studentName}
                </div>

                <div class="box">
                    <strong>Roll Number:</strong><br>
                    ${record.rollNumber}
                </div>

                <div class="box">
                    <strong>Subject:</strong><br>
                    ${record.subject}
                </div>

                <div class="box">
                    <strong>Exam:</strong><br>
                    ${record.examType}
                </div>

            </div>


            <table>

                <tr>
                    <th>Total Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Status</th>
                </tr>

                <tr>

                    <td>
                        ${record.total} /
                        ${record.maximum}
                    </td>

                    <td>
                        ${record.percentage}%
                    </td>

                    <td>
                        ${record.grade}
                    </td>

                    <td class="${
                        record.status === "PASS"
                            ? "pass"
                            : "fail"
                    }">

                        ${record.status}

                    </td>

                </tr>

            </table>


            <div class="result">

                <strong>
                    Examiner Remarks
                </strong>

                <p>
                    ${
                        record.remarks ||
                        "No remarks provided."
                    }
                </p>

            </div>


            <div class="signature">

                <div>
                    Examiner Signature
                </div>

                <div>
                    Date: ${new Date().toLocaleDateString()}
                </div>

            </div>

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.print();

}


// ================================
// INITIALIZE
// ================================

calculateResult();

renderRecords();

updateDashboard();