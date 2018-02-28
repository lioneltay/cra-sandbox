module.exports = [
  require("./types/users/User"),
  require("./types/users/User/crud"),

  require("./types/NutritionLog"),
  require("./types/NutritionLog/crud"),

  require("./types/Tag"),
  require("./types/Tag/crud"),

  require("./types/users/OxilUser"),
  require("./types/users/OxilUser/crud"),

  require("./types/users/OxilUserList"),
  require("./types/users/OxilUserList/crud"),

  require("./types/Payment"),
  require("./types/Payment/crud"),

  require("./types/FormResponse"),
  require("./types/FormResponse/crud"),

  require("./types/SurveyResponse"),

  require("./types/event/Event"),
  require("./types/event/Event/crud"),

  require("./types/event/EventTicketType"),

  require("./types/event/EventTicket"),

  // Challenger

  require('./types/challenger/ChallengerNews'),
  require('./types/challenger/ChallengerNews/crud')
]
