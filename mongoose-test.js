var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/kantor-chat');

var schema = mongoose.Schema({
    name: String
});

schema.methods.meow = function() {
    console.log(this.get('name'));
};

var Cat = mongoose.model('Cat', schema);

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    kitty.meow();
    mongoose.connection.close();//mongo-native-driver function
  }
});