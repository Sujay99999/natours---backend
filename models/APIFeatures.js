class APIFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    let queryObjTwin = { ...this.queryObj };
    const excludeKeysArr = ['page', 'limit', 'sort', 'feilds'];
    excludeKeysArr.forEach((el) => {
      delete queryObjTwin[el];
    });
    let filterStr = JSON.stringify(queryObjTwin);
    //console.log(filterStr);

    filterStr = filterStr.replace(/\b(gt|gte|lt|lte|in)\b/g, '$$' + '$1');

    //console.log(JSON.parse(filterStr));
    this.query = this.query.find(JSON.parse(filterStr));
    //console.log(this);
    return this;
  }
  sort() {
    if (this.queryObj.sort) {
      //console.log(this.queryObj.sort);
      let sortStr = this.queryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
      return this;
    } else {
      this.query = this.query.sort('price');
      return this;
    }
  }
  select() {
    if (this.queryObj.feilds) {
      let feildStr = this.queryObj.feilds.split(',').join(' ');
      this.query = this.query.select(feildStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    this.pageValue = this.queryObj.page * 1 || 1;
    this.limitValue = this.queryObj.limit * 1 || 100;
    this.skipValue = (this.pageValue - 1) * this.limitValue;
    this.query = this.query.skip(this.skipValue).limit(this.limitValue);
    //console.log(this.pageValue);
    return this;
  }
}

module.exports = APIFeatures;
