// =============================================================================
//  SINGLE SOURCE OF TRUTH — edit this file to re-brand the ad.
//  Nothing else in /src needs to change to swap restaurant, dish or food asset.
// =============================================================================
export const CONFIG = {
  RESTAURANT_NAME: 'SAFFRON FLAME',
  RESTAURANT_TAGLINE: 'Taste the difference.',
  LOGO: null,                       // optional image URL (png/svg). null => monogram glyph is drawn.
  CTA: 'ORDER NOW',
  CTA_SUB: 'Dhaka  ·  Delivery & Dine-in',   // small line under the CTA (set '' to hide)

  // ---- Hero dish ----------------------------------------------------------
  DISH_NAME: 'Smoky Saffron Smash Burger',
  DESCRIPTION: 'Double smashed beef, molten cheddar, vine tomato\nand our house saffron sauce on a toasted brioche bun.',
  PRICE: '৳ 650',                  // ৳ glyph is supplied by the bundled Bengali font
  FOOD_IMAGE: null,                 // URL of a flat food photo. null => photo is rendered from the 3D hero.
  FOOD_3D_ASSET: null,              // URL of a .glb. null => the procedural hero burger is used.

  // ---- Floating extra dishes (scene 6) -----------------------------------
  EXTRA_DISHES: [
    { id: 'cake',  name: 'Molten Lava Cake',  price: '৳ 380', entry: 'rise'   },
    { id: 'fries', name: 'Truffle Fries',     price: '৳ 290', entry: 'slide'  },
    { id: 'shake', name: 'Salted Caramel Shake', price: '৳ 420', entry: 'rotate' },
  ],

  // ---- Ingredient call-outs (scene 4) ------------------------------------
  INGREDIENTS: [
    { id: 'veg',    label: 'Fresh vegetables' },
    { id: 'protein',label: 'Premium protein' },
    { id: 'sauce',  label: 'Signature sauce' },
    { id: 'herbs',  label: 'Fresh herbs' },
    { id: 'spice',  label: 'Special seasoning' },
  ],

  // ---- Palette ------------------------------------------------------------
  COLORS: { gold: '#d9aa5b', goldHi: '#f3d79a', cream: '#f3e9d6', leather: '#2a0e0b', ink: '#0b0706' },

  // ---- Output -------------------------------------------------------------
  WIDTH: 1080, HEIGHT: 1920, FPS: 60, DURATION: 14.0,
  BPM: 120,                         // beat grid used by the timeline + cues.json
};
