const { default: axios } = require('axios');

module.exports = {
  dispatch: (event, data) => {
    axios({ url: `/${event}`, method: 'POST', data });
  },
};
