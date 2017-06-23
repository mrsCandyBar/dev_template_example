import Events from './pubsub.js';
import Data from './resources.js';

class generateCake {

  constructor(data) {
    this.description      = $('#description');
    this.menu             = $('#menu');
    this.favourites       = $('#currentCakes');
    this.cake             = $('#cake');
    this.added            = false

    this.store            = data;
    this.builder          = this.store.builder;
    this.cupcake          = this.store.cupcake;
    this.cakes            = this.store.cakes;
  }

  init() {
    this._randomizeCupcake(this.builder, this.cupcake);
    this.bindUIevents();
    /*this.bindStoreEvents(this.store);*/
  }

  _randomizeCupcake(builder, cupcake) {
    for(let property in cupcake) {
      
      if (builder[property]) {
        let getValue = this._getRandomNumberBetween(builder[property]);
        cupcake[property] = builder[property][getValue];
        
        if (property === 'icing_type') {
          if (cupcake[property] === 'swirl') {
            cupcake.type = 'tall';
            cupcake.hasCream = '';
          } else {
            cupcake.type = 'short';
            cupcake.hasWafer = '';
          }
        } 
      }
    }

    this.added = false;
    this.render();
  }

  render() {
    this._countCakes(this.cakes);
    this._generateCake('template/favourites.html', this.store, this.favourites);
    this._generateCake('template/cake.html', this.cupcake, this.cake);
    this._checkVisibility();
  }

  _countCakes(cakes) {
    cakes.forEach((cake, index) => {
      cake.index = index;
    })
  }

  _generateCake(templateUrl, getCake, destination) {
    $.get(templateUrl, (template) => {
      let rendered = Mustache.render(template, getCake);
      destination.html(rendered);
    });
  }

  bindUIevents() {
    this.menu.delegate('#randomize', 'click', (button) => {
      this._randomizeCupcake(this.builder, this.cupcake);
    });

    this.menu.delegate('#add', 'click', (button) => {
      let getCake = JSON.stringify(this.cupcake);
      this.cakes.push({ cupcake: getCake });

      this.added = true;
      this.render();
    });

    this.favourites.delegate('span', 'click', (button) => {
      let getCake = button.currentTarget.parentElement.dataset.index;
      this.cakes.splice(getCake, 1);

      if (this.cakes.length > 0) {
        if (this.cakes[getCake]) {
          getCake = this.cakes[getCake]['cupcake'];
        } else {
          getCake = this.cakes[getCake - 1]['cupcake']
        }
        getCake = JSON.parse(getCake);
        this.cupcake = getCake;
        this.render();
      }
      else {
        this.added = false;
        this._randomizeCupcake(this.builder, this.cupcake);
      } 

      return false;
    });

    this.favourites.delegate('button', 'click', (button) => {
      this.cakes.forEach((cake, index) => {
        cake.status = (index == button.currentTarget.dataset.index) ? 'active' : '';
      });
      let getCake = JSON.parse(this.cakes[button.currentTarget.dataset.index]['cupcake']);
      this.cupcake = getCake;
      this.added = true;
      this.render();
    });
  };

  _checkVisibility() {
    if (this.added === true) {
      $('#add').hide();
    } else {
      this.cakes.forEach((cake, index) => {
        cake.status = '';
      });
      $('#add').show();
    }
  }

  _getRandomNumberBetween(obj) {
    let max = obj.length - 1;
    return Math.round(Math.random() * (max - 0) + 0);;
  }

  bindStoreEvents(store) {
    Events.on('store.update.selected.cake', (selectedCake) => {
      this._setCakeAsSelected(store.cakes, selectedCake);
    });
  }

  _setCakeAsSelected(cakes, selectedCake) {
    cakes.forEach((cake, index) => {
      cake.status = (index != this.selectedCake) ? '' : 'btn-primary';
    });
  }
};

let startApp = new generateCake(Data).init();

$.get('getSVG.html', function (data) {
  $('#SVG_holder').append(data);
});