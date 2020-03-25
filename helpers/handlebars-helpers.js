const moment = require('moment');

module.exports = {
  select: function (selected, options) {
    return options.fn().replace(new RegExp(' value=\"' + selected + '\"'), '$&selected="selected"');
  },
  generateDate: function (date, format) {
    return moment(date).format(format);
  },
  paginate: function (options) {
    let output = '';
    if (options.hash.current === 1) {
      output += `<li><a>First</a></li>`;
    } else {
      output += `<li><a href="?page=1">First</a></li>`;
    }
    let i = (Number(options.hash.current) > 5 ? Number(options.hash.current) - 4 : 1);
    if (i !== 1) {
      output += `<li disabled"><a>...</a></li>`;
    }
    for (; i <= (Number(options.hash.current) + 4) && i <= options.hash.pages; i++) {
      if (i == options.hash.current) {
        output += `<li active"><a>${i}</a></li>`;
      } else {
        output += `<li><a href="?page=${i}">${i}</a></li>`;
      }
      if (i === Number(options.hash.current) + 4 && i < options.hash.pages) {
        output += `<li disabled"><a>...</a></li>`;
      }
    }
    if (options.hash.current === options.hash.pages) {
      output += `<li disabled"><a>Last</a></li>`;
    } else {
      output += `<li><a href="?page=${options.hash.pages}">Last</a></li>`;
    }
    return output;
  }
};
