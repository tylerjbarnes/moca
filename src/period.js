class Period {

    constructor (date) {
        let calibratorMoment = date ? new moment(date) : new moment();
        let dayOfMonth = calibratorMoment.date();
        let startDay = dayOfMonth < 16 ? 1 : 16;

        this.start = moment(calibratorMoment).date(startDay).format('YYYY-MM-DD');
        this.end = startDay === 1 ?
            moment(calibratorMoment).date(15).format('YYYY-MM-DD') :
            moment(calibratorMoment).endOf('month').format('YYYY-MM-DD');
    }

    next () {
        let dayInNext = moment(this.end).add(1, 'days').format('YYYY-MM-DD');
        return new Period(dayInNext);
    }

    previous () {
        let dayInPrevious = moment(this.start).add(-1, 'days').format('YYYY-MM-DD');
        return new Period(dayInPrevious);
    }

}

export default Period;
