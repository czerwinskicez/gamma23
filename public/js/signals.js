// public/js/signals.js

let Signal = window.Signal || ((signalKey, signalValue = "")=>{
    Signals[signalKey] = signalValue;
});
let Signals = window.Signals || {};
let _Signals = window._Signals || {};

_Signals.updateElementsValues = _ => {
    Object.keys(Signals).forEach(signalKey=>{
        document.querySelectorAll("[signal-key]").forEach(signalElement=>{
            signalElement.innerHTML = Signals[signalKey]
        })
    })
};

_Signals.signalHandler = {
    set: function(obj, prop, value) {
        if (obj.hasOwnProperty(prop)) {
            console.log(`Property '${prop}' changed from '${obj[prop]}' to '${value}'.`);
        } else {
            console.log(`Property '${prop}' added with value '${value}'.`);
        }
        obj[prop] = value; // Perform the actual property assignment
        _Signals.updateElementsValues();
        return true; // Indicate success
    },
    deleteProperty: function(obj, prop) {
        if (obj.hasOwnProperty(prop)) {
            console.log(`Property '${prop}' deleted.`);
            delete obj[prop];
            _Signals.updateElementsValues();
            return true;
        }
        return false;
    }
};

Signals = new Proxy(Signals, _Signals.signalHandler);

_Signals.listenToSignalsInterval = setInterval(_=>{
    document.querySelectorAll("signal:not([dispatched])").forEach(signalToDispatch=>{
        Signals[signalToDispatch.getAttribute("key")]=signalToDispatch.innerHTML;
        signalToDispatch.setAttribute("dispatched", "true");
    });
}, 10);