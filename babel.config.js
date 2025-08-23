module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          safe: false,          // true if you want .env.example enforced
          allowUndefined: false // prevents missing keys
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};
// This configuration file sets up Babel for a React Native project
// It includes presets for Expo and plugins for environment variables and Reanimated
// The react-native-dotenv plugin allows you to use environment variables in your code
// Make sure to install the necessary packages: babel-preset-expo, react-native-dotenv