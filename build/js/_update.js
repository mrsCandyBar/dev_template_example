
class UpdateStore {

  addItem(store) {
    let obj = { 
      index : store['items'].length,
      content : returnNewObj(store['brief']) 
    }
    store['active'] = parseFloat(obj['index']);
    store['items'].push(obj);
    return store;
  }

  showItem(store) {
    store['items'].forEach((item, index) => {
      item['status'] = (index === store['active']) ? 'active' : '';
    });

    let returnContent = store['items'][store.active]['content'];
    store['brief'] = returnNewObj(returnContent);
    return store;
  }

  updateItem(store) {
    this.isItemTall(store);
    if (store['items'].length > 0 && store['items'][store.active]) {
      store['items'][store.active]['content'] = returnNewObj(store['brief']);
    } 
    return store;
  }

  removeItem(store) {
    let action = new Promise((resolve, reject) => {
      store['items'].splice(store['active'], 1);

      if (store['items'].length > 0) { 
        store['items'].forEach((item, index) => {
          item['index'] = index;
        });

        store['active'] = !store['items'][store.active] ? store['active'] - 1 : store['active'];
        store = this.showItem(store);
        resolve(store);

      } else { 
        reject(store); 
      }
    });
    return action;
  }

  selectedOptions(page) {
    page.find('select').each((i, el) => {
      $(el).find('option').each((i, el) => {
        if ($(el).text() === $(el).attr('value')) {
          $(el).prop('selected',true);
        } else {
          $(el).attr('value', $(el).text());
        }
      });
    });
  }

  isItemTall(store) {

    store['$dom']['optional'].forEach((obj) => {
      let update_option;
      let optionalSelector = document.getElementById(obj.affected_selector);

      // SELECT
      if (optionalSelector && optionalSelector.type) {
        update_option = ($('#' +obj.selector).val() === obj.selected_value) ? obj.change_state[0] : obj.change_state[1];
        
        optionalSelector = $('#' +obj.affected_selector);
        optionalSelector.val(update_option).change();

      // RADIO
      } else {
        if ($('#' +obj.selector).val() != obj.selected_value) {
          optionalSelector = $('#' +obj.affected_selector).find('input[type=checkbox]');
           if( optionalSelector.is(':checked') ){
             optionalSelector.prop('checked',false);
           } 
        }        
      }
    });

    return _createNewBrief(store);
  }

  doesItemExist(store) {
    $('#add').show();
    $('#remove').hide();
    $('#favourites').show();

    if (store['items'].length > 0) {
      store['items'].forEach(item => {
        item['status'] = '';
        
        if (JSON.stringify(item['content']) === JSON.stringify(store['brief'])) {
          $('#add').hide();
          $('#remove').show();
          item['status'] = 'active';
        } 
      });
    } else {
      $('#favourites').hide();
    }
  }
};

function _createNewBrief(store) {
  for(let property in store['builder']) {
    if (document.getElementById(property).type && document.getElementById(property).type.indexOf('select') > -1) {
      store['brief'][property] = $('#' + property).val();
    } else {
      store['brief'][property] = $('#' + property).find('input[type=checkbox]').prop('checked');
    }
  };
  console.log('>>', store['brief']);
  return store;
}

function returnNewObj(obj) {
  let newObj = JSON.stringify(obj);
  newObj = JSON.parse(newObj);
  return newObj;
}

module.exports = new UpdateStore();