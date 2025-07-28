
//    var serverIP = 'http://192.168.254.46:8080/V3NityNTUC';
//    var serverIP = 'http://203.125.7.46:8080/V3NityNTUC'
//    var serverIP = window.localStorage["databaseIP"];
    var serverIP = '';
    var firstLoad = 'true';
    var canGoToJobList = false;
    var JOB_STATUS_SCHEDULED = 2;
    var JOB_STATUS_RECEIVED = 12;
    
    var calFooterDimen;
    var calHeaderDimen;
    

    $( document ).on( "pageinit", "#calendar", function( event ) 
    {
        serverIP = window.localStorage["databaseIP"];
        console.log('here serverIP: ' + serverIP);
//        window.localStorage["endedJob_7484"] = 'false';
        
        

        setTimeout(function()
        { 
            var viewport = {
                width  : $(window).width(),
                height : $(window).height()
            };
        
            calHeaderDimen = {
                width  : $('#calHeader').width(),
                height : $('#calHeader').height()
            };

            calFooterDimen = {
                width  : $('#calFooter').width(),
                height : $('#calFooter').height()
            };
            
            document.getElementById('calendarContainer').style.height = "" + (viewport.height - calHeaderDimen.height - calFooterDimen.height)*4/7 + "px";
            document.getElementById('activitiesContainer').style.height = "" + (viewport.height - calHeaderDimen.height - calFooterDimen.height)*3/7 - 10 + "px";
//            console.log('$$$ pageinit activities container height: ' + document.getElementById('activitiesContainer').style.height);
//            console.log('$$$ pageinit allActivities height: ' + document.getElementById('allActivities').style.height);
    //                + (viewport.height - calHeaderDimen.height)/2 + "px");
            setTimeout(function()
            {
                initiateMonthYear();
            }, 300);
            
            
        }, 600);

        setTimeout(function()
        { 
            var singleDayDimen = {
                width  : $('.singleDay').width(),
                height : $('.singleDay').height()
            };
//            alert('width, height: ' + singleDayDimen.width + ', ' + singleDayDimen.height);
//            document.getElementByClass('singleDay').style.lineHeight = "" + singleDayDimen.height + "px";
            var nodes = document.querySelectorAll(".singleDay");
            for (var i =0; i < nodes.length; i++) {
                nodes[i].style.lineHeight = "" + singleDayDimen.height + "px";
            }
            
            
        }, 800);
        
        
        setTimeout(function()
        { 
            firstLoad = 'false';
            initiateLogoutBtn();
        }, 2000);
        
        // DELETE
//        setTimeout(function()
//        { 
//            selectDate('day10');
//            goToJobListPage();
//        }, 2000);
        
    });
    
    
    
    $( document ).on( "pageshow", "#calendar", function( event ) 
    {
        serverIP = window.localStorage["databaseIP"];
//        serverIP = window.localStorage["databaseIP"];
//        
//        console.log('$$$ pageshow activities container height: ' + document.getElementById('activitiesContainer').style.height);
//        console.log('$$$ pageshow allActivities height: ' + document.getElementById('allActivities').style.height);
//        alert('firstload: ' + firstLoad)
//        if (firstLoad == 'false')
//        {
//            initiateMonthYear();
//        }
            
    });
    
    
    var thisMonthDatesWithJobArr = [];
    var prevMonthDatesWithJobArr = [];
    var nextMonthDatesWithJobArr = [];
    
    var thisMonthJobIsNewArr = [];
    var prevMonthJobIsNewArr = [];
    var nextMonthJobIsNewArr = [];
    
    //var car = {type:"Fiat", model:"500", color:"white"};
    var thisMonthDatesDetailsArr = [];
    var prevMonthDatesDetailsArr = [];
    var nextMonthDatesDetailsArr = [];
    
    var STATUS_CANCELLED = 11;
    
    
    
    function refreshOriginal()
    {
        window.localStorage["isCopyingJob"] = 'false';
        hideFooter();
        document.getElementById("calendarHeaderLeft").innerHTML = '<div class="headerNavLeftImg" id="logoutBtn"></div>';
        document.getElementById("calendarHeaderRight").innerHTML = '<div id="jobBiddingPageNav" class="headerNavRightImg" onclick="loadCalendar()"></div>';
        document.getElementById("footerRefreshRight").innerHTML = '<div id="footerRefreshIcon" class="footerRefreshImg" onclick="goToJobBiddingPage()"'
                    + ' style="height: ' + calFooterDimen.height + 'px; line-height: ' + calFooterDimen.height + 'px; width: ' + calFooterDimen.height + 'px">'
                    + '</div>';
        document.getElementById("footerAnnouncement").innerHTML = '<div id="footerAnnouncementIcon" onclick="goToAnnouncementPage()"'
                    + ' style="height: ' + calFooterDimen.height + 'px; line-height: ' + calFooterDimen.height + 'px; width: ' + calFooterDimen.height + 'px">'
                    + '</div>';
        document.getElementById("calendarChooseDateLabel").innerHTML = '';
        initiateLogoutBtn();
        loadCalendar();
    }
    
    function hideFooter()
    {
        document.getElementById('createJobDiv').style.display = 'none';
    }
    
    function initiateFooter()
    {
        var html = '';
        html += '<div style="float: left; height: ' + calFooterDimen.height + 'px; width: auto">';
            html += '<div class="footerLabel" style="height: ' + calFooterDimen.height/6 + 'px; width: 1px"></div>';
            html += '<div class="footerLabel" style="height: ' + calFooterDimen.height/3
                        + 'px; line-height: ' + calFooterDimen.height/3 + 'px; clear: both">Start</div>';
            html += '<div class="footerLabel" style="height: ' + calFooterDimen.height/3
                        + 'px; line-height: ' + calFooterDimen.height/3 + 'px; clear: both">Time</div>';
        html += '</div>';
                    
        document.getElementById("labelTime").innerHTML = html;
        
        html = '';
        html += '<div style="float: left; height: ' + calFooterDimen.height + 'px; width: auto">';
            html += '<div class="footerLabel" style="height: ' + calFooterDimen.height
                        + 'px; line-height: ' + calFooterDimen.height + 'px; ">Duration</div>';
        html += '</div>';
                    
        document.getElementById("labelDuration").innerHTML = html;
        
        html = '';
        html += '<div style="float: left; height: ' + calFooterDimen.height + 'px; width: auto">';
            html += '<div class="footerLabel" style="height: ' + calFooterDimen.height/4 + 'px; width: 1px"></div>';
            html += '<div id="createJobDivOk" style="height: ' + calFooterDimen.height/2
                        + 'px; width: ' + calFooterDimen.height/2 + 'px; clear: both"></div>';
        html += '</div>';
                    
        document.getElementById("divOk").innerHTML = html;
        
        html = '';
        html += '<div style="float: left; height: ' + calFooterDimen.height + 'px; width: auto">';
            html += '<div class="footerLabel" style="height: ' + calFooterDimen.height/4 + 'px; width: 1px"></div>';
            html += '<div id="createJobDivCancel" style="height: ' + calFooterDimen.height/2
                        + 'px; width: ' + calFooterDimen.height/2 + 'px; clear: both"></div>';
        html += '</div>';
                    
        document.getElementById("divCancel").innerHTML = html;
        
        document.getElementById('createJobDiv').style.display = 'block';
    }
    
    function initiateLogoutBtn()
    {
        $('#logoutBtn').bind('click', function(){
            if(localStorage.getItem("uploadQueue")=="[]"||window.localStorage["uploadQueue"]==undefined){
                    navigator.notification.confirm(
                            "Log out from this account?",
                            confirmLogout,
                            "Log Out",
                            ["✘", "✔"]
                    );
            }else{
                    navigator.notification.alert("There are jobs pending to be uploaded. Please wait for them to finish before logging out."
                                    ,function(){},"Ongoing Upload",'✔');
            }
	});
    }
    
    
    function initiateDatesDetails(jobsdata)
    {
        thisMonthDatesDetailsArr = [];
        var jobsArr = [];
        var dateExists = 'false';
        var singleDate = '';
        var singleDateJobsArr = [];
        var singleDateJobsCount = 0;
        
        var startTime;
        var endTime;
        var time;
        var hour;
        var minute;
        
        var s = '01-01-1970 00:00:00';
        var d = new Date(s.replace(/-/g, "/"));
        
        for (var i = 0 ; i < jobsdata.length ; i++)
        {
            startTime = jobsdata[i].schedule_dt.split(/ (.+)/)[1];
            
            s = '01-01-1970 ' + startTime + ':00';
            d = new Date(s.replace(/-/g, "/"));
            d.setMinutes(d.getMinutes() + parseInt(jobsdata[i].duration,10));
            hour = d.getHours();
            if (hour < 10) hour = '0' + hour;
            minute = d.getMinutes();
            if (minute < 10) minute = '0' + minute;
            endTime = hour + ':' + minute;
            time = startTime + '-' + endTime;
            //console.log('i = ' + i + ', time = ' + time);
            jobsArr[i] = 
            {
//                client: jobsdata[i].client_name,
//                nric: jobsdata[i].client_nric,
                date: jobsdata[i].schedule_dt.split(/-(.+)/)[0],
                time: time,
                status: jobsdata[i].status,
                template: jobsdata[i].template_name,
                location: jobsdata[i].location,
                description: jobsdata[i].description
            }
        }
        
        
        for (var i = 1 ; i <= 31 ; i++)
        {
            singleDate = '';
            singleDateJobsArr = [];
            singleDateJobsCount = 0;
            
            for (var j = 0 ; j < jobsArr.length ; j++)
            {
                if (jobsArr[j].date == i)
                {
                    singleDateJobsArr[singleDateJobsCount] = jobsArr[j];
                    singleDateJobsCount++;
                }
            }
            
//            console.log('i: ' + i + ', length: ' + singleDateJobsArr.length)
            
            singleDate = 
            {
                dateNumber: i,
                jobs: singleDateJobsArr
            }
            
            thisMonthDatesDetailsArr[i] = singleDate;
            
        }
    }
    
    
    function initiatePrevMonthDatesDetails(jobsdata)
    {
        prevMonthDatesDetailsArr = [];
        var jobsArr = [];
        var dateExists = 'false';
        var singleDate = '';
        var singleDateJobsArr = [];
        var singleDateJobsCount = 0;
        
        var startTime;
        var endTime;
        var time;
        var hour;
        var minute;
        
        var s = '01-01-1970 00:00:00';
        var d = new Date(s.replace(/-/g, "/"));
//        alert (d.getHours() + ':' + d.getMinutes());
//        d.setMinutes(d.getMinutes() + 30);
//        alert (d.getHours() + ':' + d.getMinutes());
        
        for (var i = 0 ; i < jobsdata.length ; i++)
        {
//            date = jobsdata[i].schedule_dt.split(/-(.+)/)[0];
            startTime = jobsdata[i].schedule_dt.split(/ (.+)/)[1];
            s = '01-01-1970 ' + startTime + ':00';
            d = new Date(s.replace(/-/g, "/"));
            d.setMinutes(d.getMinutes() + parseInt(jobsdata[i].duration,10));
            hour = d.getHours();
            if (hour < 10) hour = '0' + hour;
            minute = d.getMinutes();
            if (minute < 10) minute = '0' + minute;
            endTime = hour + ':' + minute;
            time = startTime + '-' + endTime;
            
            jobsArr[i] = 
            {
//                client: jobsdata[i].client_name,
//                nric: jobsdata[i].client_nric,
                date: jobsdata[i].schedule_dt.split(/-(.+)/)[0],
                time: time,
                status: jobsdata[i].status,
                template: jobsdata[i].template_name,
                location: jobsdata[i].location,
                description: jobsdata[i].description
            }
        }
        
        
        for (var i = 1 ; i <= 31 ; i++)
        {
            singleDate = '';
            singleDateJobsArr = [];
            singleDateJobsCount = 0;
            
            for (var j = 0 ; j < jobsArr.length ; j++)
            {
                if (jobsArr[j].date == i)
                {
                    singleDateJobsArr[singleDateJobsCount] = jobsArr[j];
                    singleDateJobsCount++;
                }
            }
            
            singleDate = 
            {
                dateNumber: i,
                jobs: singleDateJobsArr
            }
            
            prevMonthDatesDetailsArr[i] = singleDate;
        }
    }
    
    
    function initiateNextMonthDatesDetails(jobsdata)
    {
        nextMonthDatesDetailsArr = [];
        var jobsArr = [];
        var dateExists = 'false';
        var singleDate = '';
        var singleDateJobsArr = [];
        var singleDateJobsCount = 0;
        
        var startTime;
        var endTime;
        var time;
        var hour;
        var minute;
        
        var s = '01-01-1970 00:00:00';
        var d = new Date(s.replace(/-/g, "/"));
        
        for (var i = 0 ; i < jobsdata.length ; i++)
        {
//            date = jobsdata[i].schedule_dt.split(/-(.+)/)[0];
            startTime = jobsdata[i].schedule_dt.split(/ (.+)/)[1];
            s = '01-01-1970 ' + startTime + ':00';
            d = new Date(s.replace(/-/g, "/"));
            d.setMinutes(d.getMinutes() + parseInt(jobsdata[i].duration,10));
            hour = d.getHours();
            if (hour < 10) hour = '0' + hour;
            minute = d.getMinutes();
            if (minute < 10) minute = '0' + minute;
            endTime = hour + ':' + minute;
            time = startTime + '-' + endTime;
            
            jobsArr[i] = 
            {
                date: jobsdata[i].schedule_dt.split(/-(.+)/)[0],
                time: time,
                status: jobsdata[i].status,
                template: jobsdata[i].template_name,
                location: jobsdata[i].location,
                description: jobsdata[i].description
            }
        }
        
        
        for (var i = 1 ; i <= 31 ; i++)
        {
            singleDate = '';
            singleDateJobsArr = [];
            singleDateJobsCount = 0;
            
            for (var j = 0 ; j < jobsArr.length ; j++)
            {
                if (jobsArr[j].date == i)
                {
                    singleDateJobsArr[singleDateJobsCount] = jobsArr[j];
                    singleDateJobsCount++;
                }
            }
            
            singleDate = 
            {
                dateNumber: i,
                jobs: singleDateJobsArr
            }
            
            nextMonthDatesDetailsArr[i] = singleDate;
        }
    }

    var loadJobInProgress = false;
    
    function loadCalendar()
    {
        if (loadJobInProgress == true)
        {
            return;
        }
        
        loadJobInProgress = true;
        
        var monthYear = $('#monthSelection').val().split("-");
        var month = monthYear[1];
        var year = monthYear[0];
        var date = '1/' + month + '/' + year;
        
        //CHX
        //var resourceId = $('#mainResourceId').val();
        var resourceId = window.sessionStorage["userID"];
        
        var downloadURL = serverIP + "/Controller/mobile_controller.jsp?type=job&action=downloadmonthlysummary&driver=" + resourceId + "&date=" + date;
        
        spinIn();
        
        $.ajax(
        { 
            url: downloadURL,
            type: 'GET',
            timeout: 15000,
            success: function(alldata) 
            {
                thisMonthDatesWithJobArr = [];
                prevMonthDatesWithJobArr = [];
                nextMonthDatesWithJobArr = [];
                
                thisMonthJobIsNewArr = [];
                prevMonthJobIsNewArr = [];
                nextMonthJobIsNewArr = [];
                
                var receivedJob = [];
                count = 0;
                var singleJob;
                var dateNumber;
                var dateListed = 'false';
                var jobIsNew = 'false';
                
                for (var i = 0 ; i < alldata.data.jobs_this_month.length ; i++)
                {
                    dateListed = 'false';
                    jobIsNew = 'false';
                    singleJob = alldata.data.jobs_this_month[i];

                    dateNumber = singleJob.schedule_dt.split(/-(.+)/)[0]
                    
//                    if (singleJob.status == JOB_STATUS_SCHEDULED || singleJob.status == JOB_STATUS_RECEIVED)
                    if (singleJob.status == JOB_STATUS_SCHEDULED || singleJob.status == JOB_STATUS_RECEIVED)
                    {
                        jobIsNew = 'true';
                    }

                    for (var j = 0 ; j < thisMonthDatesWithJobArr.length ; j++)
                    {
                        if (dateNumber == thisMonthDatesWithJobArr[j])
                        {
                            dateListed = 'true';
                            
                            if (thisMonthJobIsNewArr[j] == 'false')
                            {
                                thisMonthJobIsNewArr[j] = jobIsNew;
                            }
                            
                            break;
                        }
                    }

                    if (dateListed == 'false')
                    {
                        thisMonthJobIsNewArr[thisMonthDatesWithJobArr.length] = jobIsNew;
                        thisMonthDatesWithJobArr[thisMonthDatesWithJobArr.length] = parseInt(dateNumber, 10);
                    }
                    
                }
                
                
                for (var i = 0 ; i < alldata.data.jobs_prev_month.length ; i++)
                {
                    dateListed = 'false';
                    jobIsNew = 'false';
                    singleJob = alldata.data.jobs_prev_month[i];

                    dateNumber = singleJob.schedule_dt.split(/-(.+)/)[0];
                    
                    if (singleJob.status == JOB_STATUS_SCHEDULED || singleJob.status == JOB_STATUS_RECEIVED)
                    {
                        jobIsNew = 'true';
                    }

                    for (var j = 0 ; j < prevMonthDatesWithJobArr.length ; j++)
                    {
                        if (dateNumber == prevMonthDatesWithJobArr[j])
                        {
                            dateListed = 'true';
                            
                            if (prevMonthJobIsNewArr[j] == 'false')
                            {
                                prevMonthJobIsNewArr[j] = jobIsNew;
                            }
                            
                            break;
                        }
                    }

                    if (dateListed == 'false')
                    {
                        prevMonthJobIsNewArr[prevMonthDatesWithJobArr.length] = jobIsNew;
                        prevMonthDatesWithJobArr[prevMonthDatesWithJobArr.length] = parseInt(dateNumber, 10);
                    }
                    
                }
                
                
                
                
                for (var i = 0 ; i < alldata.data.jobs_next_month.length ; i++)
                {
                    dateListed = 'false';
                    jobIsNew = 'false';
                    singleJob = alldata.data.jobs_next_month[i];

                    dateNumber = singleJob.schedule_dt.split(/-(.+)/)[0]

                    if (singleJob.status == JOB_STATUS_SCHEDULED || singleJob.status == JOB_STATUS_RECEIVED)
                    {
                        jobIsNew = 'true';
                    }
                    
                    for (var j = 0 ; j < nextMonthDatesWithJobArr.length ; j++)
                    {
                        if (dateNumber == nextMonthDatesWithJobArr[j])
                        {
                            dateListed = 'true';
                            
                            if (nextMonthJobIsNewArr[j] == 'false')
                            {
                                nextMonthJobIsNewArr[j] = jobIsNew;
                            }
                            
                            break;
                        }
                    }

                    if (dateListed == 'false')
                    {
                        nextMonthJobIsNewArr[nextMonthDatesWithJobArr.length] = jobIsNew;
                        nextMonthDatesWithJobArr[nextMonthDatesWithJobArr.length] = parseInt(dateNumber, 10);
                    }
                }
                
                initiateDatesDetails(alldata.data.jobs_this_month);
                initiatePrevMonthDatesDetails(alldata.data.jobs_prev_month);
                initiateNextMonthDatesDetails(alldata.data.jobs_next_month);
                initiateDates();
                spinOut();
                
                loadJobInProgress = false;
            },
            error: function(error,errorText,errorThrown) 
            {
                thisMonthDatesWithJobArr = [];
                prevMonthDatesWithJobArr = [];
                nextMonthDatesWithJobArr = [];
                
                thisMonthJobIsNewArr = [];
                prevMonthJobIsNewArr = [];
                nextMonthJobIsNewArr = [];
                
                initiateDatesDetails('');
                initiatePrevMonthDatesDetails('');
                initiateNextMonthDatesDetails('');
                initiateDates();
                
                spinOut();
                navigator.notification.alert("Unable to retrieve jobs for the month.",function(){},"Retrieve Fail",'✔');
                console.log("Error: "+error.responseText+" errorText: "+errorText+" errorThrown: "+errorThrown);
                loadJobInProgress = false;
            }	
        });
    }
    
    
    
    function goToJobListPage()
    {
//        alert($('#selectedDate').val());
        
        if ($('#selectedDate').val() == '')
        {
            navigator.notification.alert("Please select a date.",function(){},"No Date Selected",'✔');
            return;
        }
        
        var monthYear = $('#monthSelection').val().split("-");
        var month = parseInt(monthYear[1],10);
        var year = monthYear[0]; 
        var selectedDateId = $('#selectedDate').val();
        var selectedDate;
        var d = '';
        
        
        
        if (selectedDateId.indexOf('day') >= 0)
        {
            selectedDate = parseInt(selectedDateId.replace('day',''), 10);
            $('#mainSelectedDate').val(selectedDate + '/' + month + '/' + year)
        }
        else if (selectedDateId.indexOf('prev') >= 0)
        {
            selectedDate = parseInt(selectedDateId.replace('prev',''), 10);
            month = month - 1;
            if (month == 0)
            {
                month = 12;
                year = parseInt(year,10) - 1;
            }
            var s = year + '-' + month + '-' + selectedDate;
         	d = new Date(s.replace(/-/g, "/"));
        
            //d = new Date('\'' + year + '-' + month + '-' + selectedDate + '\'');
//            d.setMonth(d.getMonth() - 1);
//            month = parseInt(d.getMonth(),10) + 1;
            $('#mainSelectedDate').val(d.getDate() + '/' + month + '/' + d.getFullYear());
        }
        else if (selectedDateId.indexOf('next') >= 0)
        {
            selectedDate = parseInt(selectedDateId.replace('next',''), 10);
            
            month = month + 1;
            if (month == 13)
            {
                month = 1;
                year = parseInt(year,10) + 1;
            }
            
            var s = year + '-' + month + '-' + selectedDate;
         	d = new Date(s.replace(/-/g, "/"));
         	
            
            //d = new Date('\'' + year + '-' + month + '-' + selectedDate + '\'');
//            d.setMonth(d.getMonth() + 1);
//            month = parseInt(d.getMonth(),10);
            $('#mainSelectedDate').val(d.getDate() + '/' + month + '/' + d.getFullYear());
        }
        
//        alert($('#mainSelectedDate').val());
        
//        return;
//        var d = new Date('\'' + year + '-' + month + '-' + selectedDate + '\'');
        //console.log('calendarpage date: ' + $('#mainSelectedDate').val());
        
        //DELETE LATER
//        $('#mainSelectedDate').val('26/11/2016');
        
        $.mobile.changePage('#main', { transition: "none"});
//        alert('going to job list page for ' + selectedDate + '/' + month + '/' + year)
    }
    
    
    
    function confirmLogout(response) {
	if(response == 2){ //if OK
		logout();
	} //else do nothing
    }

    function showJobs()
    {
        if (thisMonthDatesDetailsArr.length == 0 && prevMonthDatesDetailsArr == 0 && nextMonthDatesDetailsArr == 0)
        {
            return;
        }
        
        var selectedDateId = $('#selectedDate').val();
        var datesDetailsArr = [];
        var selectedDate = 0;
        
        if (selectedDateId.indexOf('day') >= 0)
        {
            selectedDate = parseInt(selectedDateId.replace('day',''), 10);
            datesDetailsArr = thisMonthDatesDetailsArr;
        }
        else if (selectedDateId.indexOf('prev') >= 0)
        {
            selectedDate = parseInt(selectedDateId.replace('prev',''), 10);
            datesDetailsArr = prevMonthDatesDetailsArr;
        }
        else if (selectedDateId.indexOf('next') >= 0)
        {
            selectedDate = parseInt(selectedDateId.replace('next',''), 10);
            datesDetailsArr = nextMonthDatesDetailsArr;
        }
//        alert(selectedDate);
        
        var contentHtml = '';
        var theJob;
        
        for (var i = 0 ; i < datesDetailsArr[selectedDate].jobs.length ; i++)
        {
            theJob = datesDetailsArr[selectedDate].jobs[i];

            
            if (theJob.location !== null && theJob.location !== '')
            {
                contentHtml += '<div class="singleActivity" onclick="goToJobListPage()">';
                contentHtml += '<div class="activityTime">' + theJob.time + '</div>';
            }
            else
            {
                contentHtml += '<div class="singleActivityNoLoc" onclick="goToJobListPage()">';
                contentHtml += '<div class="activityTimeNoLoc">' + theJob.time + '</div>';
            }
            
                contentHtml += '<div class="activityDivider"></div>';
                contentHtml += '<div class="activitySpacer"></div>';
                contentHtml += '<div class="activityDetails">';
                
                if (theJob.location !== null && theJob.location !== '')
                {
                    contentHtml += '<div class="jobDetailsTemplate">' + theJob.template + '</div>';
                    contentHtml += '<div class="jobDetailsLocDesc">' + theJob.location + '</div>';
                }
                else
                {
                    contentHtml += '<div class="jobDetailsTemplateNoLoc">' + theJob.template + '</div>';
                }
                contentHtml += '</div>';
            contentHtml += '</div>';

            if (i != datesDetailsArr[selectedDate].jobs.length - 1)
            {
                contentHtml += '<div class="singleActivitySpacer"></div>';
            }
        }
        
        document.getElementById("allActivities").innerHTML = '';
        
        setTimeout(function()
        { 
            document.getElementById("allActivities").innerHTML = contentHtml;
            adjustActivitiesLineHeight();
        }, 100);
        
        
    }
    
    function selectDate(dateId)
    {
        var selectedDate = $('#selectedDate').val();
        var datesDetailsArr = [];
        var dateNumber = 1;
        
        if (selectedDate != '')
        {
            $('#'+selectedDate).removeClass('singleDateSelected');
        }
        
        $('#'+dateId).addClass('singleDateSelected');
        $('#selectedDate').val(dateId);
        
        showJobs();
    }
    
    function initiateDates()
    {
        var monthYear = $('#monthSelection').val().split("-");
        var month = parseInt(monthYear[1],10) - 1;
        var year = monthYear[0];
        $('#selectedDate').val('');
        
        var lastSundayPreviousMonth = getLastSundayPreviousMonth(year, month-1);
        var firstDayThisMonth = getFirstDayThisMonth(year, month);
        
        var date = new Date(year,month,1);
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        var allDatesHtml = '';
        var dayNumber = 0;
        var dayCountToThisMonth = 0;
        var extraDays = 1;
        var monthStartsWithSundayDone = 'false';
        
        if (firstDayThisMonth !== 0)
        {
            monthStartsWithSundayDone = 'true';
        }
        
        for (var i = 0 ; i < 6 ; i++)
        {
            allDatesHtml += '<div class="singleLine">';
            
            for (var j = 0 ; j < 7 ; j++)
            {
                if (firstDayThisMonth == 0 && monthStartsWithSundayDone == 'false')
                {
                    if (dayCountToThisMonth < 7)
                    {
                        allDatesHtml += '<div class="singleDate singleDateNotThisMonth" id="prev' + (lastSundayPreviousMonth+dayCountToThisMonth) + '"' 
                                                + ' onclick="selectDate(\'prev' + (lastSundayPreviousMonth+dayCountToThisMonth) + '\')">' 
                                                + (lastSundayPreviousMonth+dayCountToThisMonth) + '</div>';
                        dayCountToThisMonth++;

                        if (j == 6)
                        {
                            monthStartsWithSundayDone = 'true'
                        }
                    }
                }
                else if (dayCountToThisMonth < firstDayThisMonth )
                {
                    allDatesHtml += '<div class="singleDate singleDateNotThisMonth" id="prev' + (lastSundayPreviousMonth+dayCountToThisMonth) + '"' 
                                            + ' onclick="selectDate(\'prev' + (lastSundayPreviousMonth+dayCountToThisMonth) + '\')">' 
                                            + (lastSundayPreviousMonth+dayCountToThisMonth) + '</div>';
                    dayCountToThisMonth++;
                }
                else if (dayNumber <= lastDay.getDate()-1 && monthStartsWithSundayDone == 'true')
                {
                    if (j != firstDay.getDay() && dayNumber == 0 )
                    {
                        allDatesHtml += '<div class="singleDate"></div>';
                    }
                    else
                    {
                        dayNumber++;
                        allDatesHtml += '<div class="singleDate singleDateNoData" id="day' + dayNumber + '"' 
                                            + ' onclick="selectDate(\'day' + dayNumber + '\')">' 
                                            + dayNumber + '</div>';
                    }
                }
                else if (dayNumber > lastDay.getDate()-1)
                {
                    allDatesHtml += '<div class="singleDate singleDateNotThisMonth" id="next' + extraDays + '"' 
                                            + ' onclick="selectDate(\'next' + extraDays + '\')">' 
                                            + extraDays + '</div>';
                    extraDays++;
                }
                
                if (j != 6)
                {
                    allDatesHtml += '<div class="singleDateSpacer"></div>';
                }
            }
            
            allDatesHtml += '</div>';
            allDatesHtml += '<div class="singleLineSpacer"></div>';
        }
        
        document.getElementById("allDates").innerHTML = allDatesHtml;
        
        for (var j = 0 ; j < thisMonthDatesWithJobArr.length ; j++)
        {
            $('#day'+thisMonthDatesWithJobArr[j]).removeClass('singleDateNoData');
            
            if (thisMonthJobIsNewArr[j] == 'true')
            {
                $('#day'+thisMonthDatesWithJobArr[j]).addClass('singleDateWithDataNew');
            }
            else
            {
                $('#day'+thisMonthDatesWithJobArr[j]).addClass('singleDateWithData');
            }
        }
        
        for (var j = 0 ; j < prevMonthDatesWithJobArr.length ; j++)
        {
            $('#prev'+prevMonthDatesWithJobArr[j]).removeClass('singleDateNotThisMonth');
            
            if (prevMonthJobIsNewArr[j] == 'true')
            {
                $('#prev'+prevMonthDatesWithJobArr[j]).addClass('singleDateNotThisMonthWithDataNew');
            }
            else
            {
                $('#prev'+prevMonthDatesWithJobArr[j]).addClass('singleDateNotThisMonthWithData');
            }
        }
        
        for (var j = 0 ; j < nextMonthDatesWithJobArr.length ; j++)
        {
            $('#next'+nextMonthDatesWithJobArr[j]).removeClass('singleDateNotThisMonth');
            if (nextMonthJobIsNewArr[j] == 'true')
            {
                $('#next'+nextMonthDatesWithJobArr[j]).addClass('singleDateNotThisMonthWithDataNew');
            }
            else
            {
                $('#next'+nextMonthDatesWithJobArr[j]).addClass('singleDateNotThisMonthWithData');
            }
        }
        
        var singleDateDimen = {
            width  : $('.singleDate').width(),
            height : $('.singleDate').height()
        };
        var nodes = document.querySelectorAll(".singleDate");
        for (var i =0; i < nodes.length; i++) {
            nodes[i].style.lineHeight = "" + singleDateDimen.height + "px";
        }
        
        
        // DELETE -- always set to day1
        selectDate('day1');

//        var today = new Date();
//        var dd = today.getDate();
//        selectDate('day'+dd);
        
    }
    
    
    function adjustActivitiesLineHeight()
    {
        var activityDimen = {
            width  : $('.activityTime').width(),
            height : $('.activityTime').height()
        };
        var nodes = document.querySelectorAll(".activityTime");
        for (var i =0; i < nodes.length; i++) {
            nodes[i].style.lineHeight = "" + activityDimen.height/2 + "px";
        }
        
        activityDimen = {
            width  : $('.jobDetailsTemplate').width(),
            height : $('.jobDetailsTemplate').height()
        };
        nodes = document.querySelectorAll(".jobDetailsTemplate");
        for (var i =0; i < nodes.length; i++) {
            nodes[i].style.lineHeight = "" + activityDimen.height + "px";
        }
        
        activityDimen = {
            width  : $('.jobDetailsLocDesc').width(),
            height : $('.jobDetailsLocDesc').height()
        };
        nodes = document.querySelectorAll(".jobDetailsLocDesc");
        for (var i =0; i < nodes.length; i++) {
            nodes[i].style.lineHeight = "" + activityDimen.height + "px";
        }
        
        activityDimen = {
            width  : $('.jobDetailsTemplateNoLoc').width(),
            height : $('.jobDetailsTemplateNoLoc').height()
        };
        nodes = document.querySelectorAll(".jobDetailsTemplateNoLoc");
        for (var i =0; i < nodes.length; i++) {
            nodes[i].style.lineHeight = "" + activityDimen.height + "px";
        }
        
        activityDimen = {
            width  : $('.activityTimeNoLoc').width(),
            height : $('.activityTimeNoLoc').height()
        };
        nodes = document.querySelectorAll(".activityTimeNoLoc");
        for (var i =0; i < nodes.length; i++) {
            nodes[i].style.lineHeight = "" + activityDimen.height + "px";
        }
        
//        console.log('$$$ adjustActivitiesLineHeight allActivities height: ' + document.getElementById('allActivities').style.height);
//        console.log('$$$ adjustActivitiesLineHeight innerhtml: ' + document.getElementById('allActivities').innerHTML);
    }
    
    
    function initiateMonthYear()
    {
        var today = new Date();
        var mm = parseInt(today.getMonth(),10) + 1; //January is 0!
        var yyyy = today.getFullYear();

        if(mm<10) {
            mm='0'+mm;
        }

        today = yyyy + '-' + mm;
        
        var monthControl = document.querySelector('input[type="month"]');
        monthControl.value = '' + today;
        changeMonthYear();
        
        adjustActivitiesLineHeight();
    }
    
    
    function changeMonthYear()
    {
        //initiateDates();
        setTimeout(function()
        { 
            loadCalendar();
        }, 100);
    }
    
    function getLastSundayPreviousMonth(year, month) 
    {
        if (month == -1)
        {
            month = 11;
            year = year-1;
        }
//        alert(year + ', ' + month)
        
        var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31]
        if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) lastDay[2] = 29
        
        var date = new Date();
        date.setFullYear(year, month, lastDay[month])
        date.setDate(date.getDate()-date.getDay())
        return date.getDate();
        
//        for (var date = new Date(), month=0; month<12; month+=1) {
//                date.setFullYear(year, month, lastDay[month])
//                date.setDate(date.getDate()-date.getDay())
//                if (month == 3 || month == 11)
//                {
//                    alert(date.toISOString().substring(0,10));
//                }
//                document.write(date.toISOString().substring(0,10), '<br>')
//        }   
    }
    
    function getFirstDayThisMonth(year, month) 
    {
        var lastDay = [31,28,31,30,31,30,31,31,30,31,30,31]
        if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)) lastDay[2] = 29
        
        var date = new Date();
        date.setFullYear(year, month, 1)
        return date.getDay();
    }
 