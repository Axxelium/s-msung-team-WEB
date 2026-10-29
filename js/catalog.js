(() => {
  'use strict';
  
  const products = [
    { id: 'cappuccino', name: 'Cappuccino', price: 1290, category: 'coffee', image: 'images/Cappucino.jpg', description: 'Double espresso and silky milk foam.' },
    { id: 'morning-set', name: 'Morning Set', price: 2490, category: 'breakfast', image: 'images/cofee.jpg', description: 'Cappuccino, a fresh croissant, and jam.' },
    { id: 'mania-brunch', name: 'Mania Brunch', price: 3190, category: 'breakfast', image: 'images/zavtrak.jpg', description: 'Toast, egg, berries, and fresh filter coffee.' },
    { id: 'berry-puff', name: 'Berry Puff', price: 1490, category: 'bakery', image: 'images/pirog.jpg', description: 'Flaky pastry, cream, and seasonal berries.' },
    { id: 'lunch-set', name: 'Lunch Set', price: 3790, category: 'lunch', image: 'images/lunch.jpg', description: 'A hot dish, salad, and homemade lemonade.' },
    { id: 'tea', name: 'Sea-Buckthorn Tea', price: 1190, category: 'tea', image: 'images/tea.jpg', description: 'Bright berry tea with honey.' },
    { id: 'dessert', name: 'Dessert of the Day', price: 1690, category: 'bakery', image: 'images/desert.jpg', description: 'A sweet finish with seasonal fruit and cream.' }
  ];

  window.CafeMania = {
    products,
    productById: (id) => products.find((product) => product.id === id),
    money: (amount) => `${new Intl.NumberFormat('en-US').format(amount)} ₸`,
    element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }
  };
})();
