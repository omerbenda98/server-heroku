const normalizeCard = (card, userId) => {
  card.imageUrl =
    card.imageUrl ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  card.user_id = card.user_id || userId;

  return card;
};

module.exports = normalizeCard;
