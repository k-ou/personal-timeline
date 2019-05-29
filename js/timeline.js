$(document).ready(function () {
    const tagsRendered = ['KO', 'LB', 'OU', 'BA'];
    renderRows(tagsRendered);
    $('.filter-btn').click(function () {
        const tagSelected = $(this).attr('data-attr');
        filterSelection(tagSelected);
    })
});

function renderRows(tagsRendered) {
    $.ajax({
        type: "GET",
        url: "timeline.csv",
        dataType: "text",
        success: function (response) {
            const rows = $.csv.toObjects(response).filter(r => !isEmptyRow(r));
            if (rows.length !== 0) {
                $('#timeline-container').css('display', 'block');
                $('#timeline-container').append(renderRow(rows, tagsRendered))
            }
        }
    });
}

// for each element of row, add p tags
// append each of those to the main container
// if more info, add expand button
// add email button
// if mobile, remove position and clearance (this might be done with css display none)

//let winWidth = isMobile();
//
//$(window).on('resize', function () {
//    if (winWidth != isMobile()) {
//        winWidth = isMobile();
//        deleteRow();
//        renderRows();
//    }
//});
//
function deleteRow() {
    $('#timeline').remove();
}

// when mobile, only show title
// when tablet/desktop, show title, location, clearance
// if row has non-empty other cols (not shown in main view)
// then show expand button and enable expand-to-modal

// if click event occurs on an expandable row
// then create modal
function renderRow(rows, tagList) {
    var container = $('<div id="timeline"></div>');
    var pointer = 0;
    var pointerYear = rows[pointer]['YEAR'];
    var currentYear = new Date().getFullYear();
    while (pointerYear <= currentYear) {
        var timelineRow = $('<div></div>').addClass('timeline-row');
        var yearContainer = $('<div></div>').addClass('timeline-year-container');
        var year = $('<p class="timeline-year"></p>').append(pointerYear);
        yearContainer.append(year);
        var eventContainer = $('<div class="timeline-event-container"></div>');
        while (rows[pointer] && pointerYear == rows[pointer]['YEAR']) {
            var month = $('<p class="timeline-month"></p>').append(rows[pointer]['MONTH']);
            var event = $('<p class="timeline-event"></p>').append(rows[pointer]['EVENT']);
            switch (rows[pointer]['PERSON']) {
                case 'LB':
                    event.addClass('text-lb');
                    break;
                case 'BA':
                    event.addClass('text-ba');
                    break;
                case 'KO':
                    event.addClass('text-ko');
                    break;
                case 'OU':
                    event.addClass('text-ou');
                    break;
                case 'KL':
                    event.addClass('text-kl');
                    break;
            }
            eventContainer.append(month);
            eventContainer.append(event);
            pointer++;
        }
        timelineRow.append(yearContainer);
        timelineRow.append(eventContainer);
        container.append(timelineRow);
        pointerYear++;
    }
    return container;
}

function filterSelection(rows) {
    deleteRow();
    renderRow(rows, tagsRendered);
}

function filterObjectByKeys(obj, predicate) {
    return Object
        .keys(obj)
        .reduce(
            (result, k) => ({
                ...result,
                ...(
                    predicate(k) ? {
                        [k]: obj[k]
                    } : {}
                )
            }), {}
        )
}

function isEmptyRow(rowObj) {
    for (k in rowObj) {
        const property = rowObj[k];
        if (property !== "" && property !== undefined) {
            return false;
        }
    }
    return true;
}

function getKeys() {
    const keys = ['Position'];
    return isMobile() ? keys : [...keys, 'Location', 'Clearance'];
}

function isMobile() {
    return ($(window).width() < 1024);
}

function deleteModal() {
    $('#career-modal-container').remove();
    $('body').css('overflow', 'auto');
}

function renderModal(row, otherRows) {
    $('body').css('overflow', 'hidden');
    const container = $('<div id="career-modal-container"></div>').click(deleteModal);
    const modal =
        $('<div id="career-modal"></div>').click(function (e) {
            e.stopPropagation();
        });
    modal.append(renderHeader(row));
    const positionInformation = $('<div id="position-information"></div>');
    const roleDescription = $('<div class="position-section description"></div>');

    const jobID = $('<p><span>JOB ID: </span> </p>').append(otherRows['JobID']);
    // if mobile, showcase LOCATION, CLEARANCE, AND JOB ID at the beginning of the modal
    if (isMobile()) {
        const location = $('<p><span>Location: </span> </p>').append(row['Location']);
        const clearance = $('<p><span>Clearance: </span> </p>').append(row['Clearance']);
        roleDescription.append(location);
        roleDescription.append(clearance);
        roleDescription.append(jobID);
    }
    // ROLE DESCRIPTION
    if (otherRows.hasOwnProperty('RoleDescription')) {
        const roleDescriptionValue = $('<p></p>').append(otherRows['RoleDescription']);
        const roleDescriptionHeader = $('<h6>Role Description</h6>');
        roleDescription.append(roleDescriptionHeader);
        roleDescription.append(roleDescriptionValue);
        if (!isMobile()) {
            roleDescription.append(jobID);
        }
    }
    if (!isMobile() && !otherRows.hasOwnProperty('RoleDescription')) {
        roleDescription.append(jobID);
    }
    positionInformation.append(roleDescription);
    // MODAL CTA
    const cta = $('<div id="modalCTA" class="position-section border-grey content-container"><h5>Interested in this position?</h5><p>Send us an email with the Job ID as the subject, and attach your resume, optional cover letter, and any other relevant documents.</p><a href="mailto:careers@strategicmissionelements.com?subject=Interested in Job ' + otherRows['JobID'] + '" target="_blank"><button class="button-teal button-center"><p>SEND YOUR RESUME</p><div class="arrow-full arrow-teal"><div class="arrow-line"></div><div class="arrow-head"></div></div></button></a></div>');
    positionInformation.append(cta);
    // parse BASICQUALIFICATIONS for bullets
    if (otherRows.hasOwnProperty('BasicQualifications')) {
        const basicQualificationsContainer = $('<div id="basicQualificationsContainer" class="position-section"><h6>Basic Qualifications</h6></div>');
        const basicQualifications = $('<ul></ul>').attr('id', 'basicQualifications');
        const fullStr = otherRows['BasicQualifications'];
        const splitStr = fullStr.split('*').slice(1);
        $.each(splitStr, function (key, value) {
            basicQualifications.append('<li>' + value + '</li>');
        });
        basicQualificationsContainer.append(basicQualifications);
        positionInformation.append(basicQualificationsContainer);
    }
    // parse ADDITIONALQUALIFICATIONS for bullets
    if (otherRows.hasOwnProperty('AdditionalQualifications')) {
        const additionalQualificationsContainer = $('<div id="additionalQualificationsContainer" class="position-section"><h6>Additional Qualifications</h6></div>');
        const additionalQualifications = $('<ul></ul>').attr('id', 'additionalQualifications');
        const additionalFullStr = row['AdditionalQualifications'];
        const additionalSplitStr = additionalFullStr.split('*').slice(1);
        $.each(additionalSplitStr, function (key, value) {
            additionalQualifications.append('<li>' + value + '</li>');
        });
        additionalQualificationsContainer.append(additionalQualifications);
        positionInformation.append(additionalQualificationsContainer);
    }
    modal.append(positionInformation);
    container.append(modal);
    $('body').append(container);
}

// render HEADER for MODAL
function renderHeader(row) {
    var container = $('<div></div>').addClass('position');
    const allKeys = Object.keys(row);
    var renderedKeys = ['Position'];
    // if not mobile, show additional initial information
    if (!isMobile()) {
        renderedKeys = [...renderedKeys, 'Location', 'Clearance'];
    }
    const renderedRows = renderedKeys.map(k => $('<p></p>').append(row[k]));
    container.append(renderedRows);
    const buttons = $('<div id="buttons"></div>');
    var otherKeys = allKeys.filter(k => !renderedKeys.includes(k));
    otherKeys = otherKeys.filter(k => row[k] !== '');
    //    if there's additional information besides what's already been listed, + jobID, then indicate that element is clickable
    if (otherKeys.length > 1) {
        container.addClass('clickable');
        // show expand button
        buttons.append('<img src="img/expand-02.svg" alt="expand" class="button-expand">');
        // on click, delete modal
        container.click(deleteModal);
    }
    // if not mobile, show email button
    if (!isMobile()) {
        buttons.append('<a href="mailto:careers@strategicmissionelements.com?subject=Interested in Job ' + row['JobID'] + '" target="_blank"><img src="img/expand-03.svg" alt="email" class="button-email"></a>')
    }
    container.append(buttons);
    return container;
}
