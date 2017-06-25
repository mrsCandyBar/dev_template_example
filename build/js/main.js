import Events from './pubsub.js';
import Data from './resources.js';
import Update from './updateStore.js';
import RandomCupcake from './randomize.js';

class generateCake {

  constructor(data) {
    this.$cake             = $('#cake');
    this.$control          = $('#controls');
    this.$add              = $('#add');
    this.$remove           = $('#remove');
    this.$menu             = $('#toggle_menu');
    this.store             = data;
  }

  init() {
    this.bindStoreEvents();
    this.bindUIevents(this.store);
    Events.emit('create.random.cake', this.store);
  }

  render(store) {
    this._generateCake('template/cake.html', store.cupcake, this.$cake);
    this._checkIfCakeExists(store);
  }

  _generateCake(templateUrl, getCake, destination) {
    $.get(templateUrl, (template) => {
      let rendered = Mustache.render(template, getCake);
      destination.html(rendered);
    });
  }

  _checkIfCakeExists(store) {
    this.$add.show();
    this.$remove.hide();
    this.$menu.show();

    if (store.cakes.length > 0) {
      store.cakes.forEach(cake => {
        cake.status = '';
        
        if (JSON.stringify(cake.cupcake) === JSON.stringify(store.cupcake)) {
          this.$add.hide();
          this.$remove.show();
          cake.status = 'active';
        } 
      });
    } else {
      this.$menu.hide();
    }
  }

  bindUIevents(store) {
    this.$control.delegate('#randomize', 'click', (button) => {
      Events.emit('create.random.cake', store);
    });

    this.$control.delegate('#add', 'click', (button) => {
      Events.emit('add.random.cake', store);
    });

    this.$control.delegate('#remove', 'click', (button) => {
      Events.emit('remove.cake.from.list', store);
    });

    this.$control.delegate('#toggle_menu', 'click', (button) => {
      this._generateCake('template/favourites.html', store, this.$cake);
    });

    this.$control.delegate('#edit', 'click', (button) => {
      Events.emit('edit.cake.from.list', store);
    });

    this.$cake.delegate('button', 'click', (button) => {
      console.log('click', button);
      store.index = button.currentTarget.dataset.index;
      Events.emit('select.cake.from.list', store);
    });
  };

  bindStoreEvents() {
    Events.on('create.random.cake', (store) => {
      this.render(RandomCupcake.createRandomCupcake(store));
    });
    Events.on('add.random.cake', (store) => {
      this.render(Update.addCakeToList(store));
    });
    Events.on('select.cake.from.list', (store) => {
      this.render(Update.showCakeFromList(store));
    });
    Events.on('remove.cake.from.list', (store) => {
      Update.removeCakeFromList(store).then((updateStore) => {
        this.render(updateStore);
      }, (emptyStore) => {
        Events.emit('create.random.cake', store);
      });
    });

    Events.on('edit.cake.from.list', (store) => {
      this._generateCake('template/edit.html', store.cupcake, this.$cake);
    });
  }
};

let startApp = new generateCake(Data).init();
$.get('getSVG.html', function (data) {
  $('#SVG_holder').append(data);
});