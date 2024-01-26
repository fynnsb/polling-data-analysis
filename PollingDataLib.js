const PollingDataLib = (() => {
    var dataFromPolls = (surveys1, parties1) => {
        surveys = Object.values(surveys1);
        var parties = parties1;
        
        surveys.forEach(survey => {
            Object.keys(survey.Results).forEach(partyId => {
                if(parties[partyId].Results == undefined) {
                    parties[partyId].Results = [];
                }
                parties[partyId].Results.push(survey.Results[partyId]);
            });
        });

        Object.keys(parties).forEach(partyId => {
            var sum = 0;
            if(parties[partyId].Results == undefined) return;

            parties[partyId].Results.forEach(result => {
                sum += result;
            });
            parties[partyId].Average = sum / parties[partyId].Results.length;
        });

        var data = [];
        Object.keys(parties).forEach(partyId => {
            if(parties[partyId].Average == undefined) return;
            data.push({ name: parties[partyId].Name, value: parties[partyId].Average });
        });

        return data;
    };

    var currentPolling = (data1, parliament1) => {
        var data = JSON.parse(JSON.stringify(data1));
        var parliament = JSON.parse(JSON.stringify(parliament1));
        var parties = JSON.parse(JSON.stringify(data.Parties));
        var surveys = data.Parliaments[parliament].Surveys;
        var institutes = data.Institutes;

        var latestPolls = [];

        Object.keys(institutes).forEach(instituteId => {
            var institute = institutes[instituteId];
            var instituteSurveys = surveys.filter(survey => survey.Institute_ID === instituteId);
            if(instituteSurveys.length === 0) return;

            var latestSurvey = instituteSurveys[instituteSurveys.length - 1];

            // Check if the latest survey is older than 30 days
            var surveyDate = new Date(latestSurvey.Date);
            var date = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
            if(surveyDate < date){
                return;
            }

            latestPolls[instituteId] = latestSurvey;
        });

        if(latestPolls.length === 0){
            // If there are no polls in the last 30 days, use the latest poll
            latestPolls[surveys[surveys.length - 1].Institute_ID] = surveys[surveys.length - 1];
        }

        var results = dataFromPolls(latestPolls, parties);
        return results;
    };

    return {
        currentPolling,
    };
})();

module.exports = PollingDataLib;
