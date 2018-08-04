module.exports = () => {
    Number.prototype.isBetween = function(a, b) {
        return a <= this && this <= b;
    }
};