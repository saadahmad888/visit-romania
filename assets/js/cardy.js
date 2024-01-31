/*
  Theme Name: Cardy - HTML Credit Card Payment Form
*/

const validCreditcard = cardnumb => {
    cardnumb = number_pattern(cardnumb).replace(/[^\d.-]/g, '');

    const ccErrors = [];
    ccErrors[1] = "No card type detected";
    ccErrors[2] = "Credit card number is invalid";
    ccErrors[3] = "Credit card number has an inappropriate number of digits";
    ccErrors[4] = "Warning! This credit card number is associated with a scam attempt";

    const response = (success, message = null, type = null, full = false, length = null) => ({
        message,
        success,
        type,
        full,
        length
    });

    const cards = [
        {
            name: "visa",
            length: "16",
            prefixes: "4"
        },
        {
            name: "mastercard",
            length: "16",
            prefixes: "51,52,53,54,55"
        },
        {
            name: "amex",
            length: "15",
            prefixes: "34,37"
        },
        {
            name: "unionpay",
            length: "16",
            prefixes: "5610,560"
        },
        {
            name: "maestro",
            length: "16",
            prefixes: "5018,5020,5038,6304,6759,6761,6762,6763"
        }
    ];


    const luhnCheck = val => {
        let validsum = 0;
        let k = 1;
        for (let l = val.length - 1; l >= 0; l--) {
            let calck = 0;
            calck = Number(val.charAt(l)) * k;
            if (calck > 9) {
                validsum = validsum + 1;
                calck = calck - 10;
            }
            validsum = validsum + calck;
            if (k == 1) {
                k = 2;
            } else {
                k = 1;
            }
        }
        return (validsum % 10) == 0;
    }

    let prefixValid = false;
    let lengthValid = false;

    for (let l = 0; l < cards.length; l++) {
        const prefix = cards[l].prefixes.split(",");
        const lengths = cards[l].length.split(",");
        const cardCompany = cards[l].name;
        const cardLength = cards[l].length;

        for (let k = 0; k < prefix.length; k++) {
            const exp = new RegExp("^" + prefix[k]);
            if (exp.test(cardnumb)) {
                prefixValid = true;
            }
        }

        for (let k = 0; k < lengths.length; k++) {
            if (prefixValid && cardnumb.length == lengths[k]) {
                lengthValid = true;
            }
        }

        if (prefixValid && lengthValid) {
            if(luhnCheck(cardnumb)){
                return response(true, null , cardCompany, lengthValid, cardLength);
            }else{
                return response(true, ccErrors[2] , cardCompany, lengthValid, cardLength);
            }
        }else if(prefixValid){
            return response(true, ccErrors[3] , cardCompany, lengthValid, cardLength);
        }
    }

    if (!prefixValid && cardnumb.length > 10) {
        return response(false, ccErrors[2]);
    } else if(!prefixValid){
        return response(false, ccErrors[1]);
    }

    return response(true, null, cardCompany, lengthValid);
}

function number_pattern(value, length) {
    value = value.replace(/[^\d.-]/g, '');
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = v.match(`\\d{4,${length ? length : 16}}`, 'gi');
    let match = matches && matches[0] || '';
    let spacing = [0, 4, 8, 12];
    if(+length === 12){
        spacing = [0, 4, 8];
    } else if(+length === 13){
        spacing = [0, 5, 10];
    } else if(+length === 14){
        spacing = [0, 4, 10];
    } else if(+length === 15){
        spacing = [0, 5, 10, 15];
    } else if(+length === 17){
        spacing = [0, 5, 9, 13];
    } else if(+length === 18){
        spacing = [0, 4, 9, 13];
    }
    let parts = []
    for (let i=0; i<spacing.length; i++) {
        if(match.length > spacing[i]){
            parts.push(match.substring(spacing[i], spacing[i+1]))
        }
    }
    if (parts.length) {
        return parts.join(' ')
    } else {
        return value
    }
}
function exp_pattern(value) {
    value = value.replace(/[^\d.-]/g, '');
    let v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = v.match(/\d{2,4}/g);
    let match = matches && matches[0] || ''
    let parts = []
    for (let i=0, len=match.length; i<len; i+=2) {
        parts.push(match.substring(i, i+2))
    }
    if (parts.length) {
        return parts.join('/')
    } else {
        return value
    }
}

$(function() {
    $( ".cardy__number__input" ).on("input", function(e) {
        let cardLogos = $(this).parent().parent().children(".cardy__logo");
        if(e.target && e.target.value){
            let value = validCreditcard(e.target.value);
            $(this).val(number_pattern(e.target.value, value.length));
            $(this).closest(".cardy__logo").children("span");
            if(value && value.type && cardLogos.children(`.${value.type}`).length){
                cardLogos.children(".cardy__logo__item").removeClass("active");
                cardLogos.children(`.${value.type}`).addClass("active");
            }
        } else{
            $(this).val(number_pattern(e.target.value));
            cardLogos.children(".cardy__logo__item").removeClass("active")
            for(let i=0; i<3; i++){
                cardLogos.children(".cardy__logo__item").eq(i).addClass("active")
            }
        }
    });
    $( ".cardy__exp__input" ).on("input", function(e) {
        if(e.target && e.target.value){
            $(this).val(exp_pattern(e.target.value));
        }
    });
});
