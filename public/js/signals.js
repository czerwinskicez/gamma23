// public/js/signals.js

let _Signals = window._Signals || {};

_Signals.store = _Signals.store || JSON.parse(window.sessionStorage.getItem("Signals_store")) || {};


let Signal = window.Signal || ((signalKey, signalValue = "")=>{
    Signals[signalKey] = signalValue;
});
let Signals = window.Signals || {};

_Signals.updateElementsValues = _ => {
    Object.keys(Signals).forEach(signalKey=>{
        document.querySelectorAll(`[signal-key=${signalKey}]`).forEach(signalElement=>{
            signalElement.innerHTML = Signals[signalKey]
        })
    })
};

_Signals.signalHandler = {
    set: function(obj, prop, value) {
        // if (obj.hasOwnProperty(prop)) {} else {}
        obj[prop] = value;
        _Signals.store[prop] = value;
        _Signals.updateElementsValues();

        window.sessionStorage.setItem("Signals_store", JSON.stringify(_Signals.store));
        return true;
    },
    deleteProperty: function(obj, prop) {
        if (obj.hasOwnProperty(prop)) {
            delete obj[prop];
            _Signals.updateElementsValues();
            return true;
        }
        return false;
    }
};

Signals = new Proxy(Signals, _Signals.signalHandler);

_Signals.signalClock = _Signals.signalClock || setInterval(_=>{
    document.querySelectorAll("signal:not([dispatched])").forEach(signalToDispatch=>{
        Signals[signalToDispatch.getAttribute("key")]=signalToDispatch.innerText;
        signalToDispatch.setAttribute("dispatched", "true");

    });
}, 10);

_Signals.scriptClock = _Signals.scriptClock || setInterval(_=>{
    document.querySelectorAll("script[signal]:not([dispatched='true'])").forEach(scriptSignal=>{
        const scriptElement = document.createElement("script");
        scriptElement.textContent = scriptSignal.textContent;
        scriptSignal.setAttribute('dispatched', 'true')
        document.body.appendChild(scriptElement);
    });
}, 200);

try {
    const objectToSerialize = JSON.parse(document.querySelector("signal[type='object']").innerHTML);
    Object.keys(objectToSerialize).forEach(objectToSerializeKey=>{
        const newSignalElement = document.createElement("signal");
        newSignalElement.setAttribute("key", objectToSerializeKey);
        newSignalElement.innerHTML = objectToSerialize[objectToSerializeKey];
        document.body.append(newSignalElement);
    });
} catch (_) { false; }

setTimeout(_=>{
    Object.keys(_Signals.store).forEach(storeKey=>{
        Signal(storeKey, _Signals.store[storeKey]);
    });
}, 1);