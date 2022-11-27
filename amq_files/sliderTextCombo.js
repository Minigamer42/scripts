function SliderTextCombo($slider, textfields, sliderSettings) {
    this.max = sliderSettings.max ? sliderSettings.max : Math.max;
    this.min = sliderSettings.min ? sliderSettings.min : Math.min;
    this.$slider = $slider;

    if (Array.isArray(textfields)) {
        this.textfields = textfields;
    } else {
        this.textfields = [textfields];
    }

    this._listener = [];

    this.$slider.slider(sliderSettings);
    $slider.on("change", (event) => {
        let newValue = event.value.newValue;
        let oldValue = event.value.oldValue;
        let valueArray;
        if (Array.isArray(newValue)) {
            valueArray = newValue;
        } else {
            valueArray = [newValue];
        }
        valueArray.forEach((value, index) => {
            this.textfields[index].val(value);
        });
        this._listener.forEach(listener => {
            listener(newValue, oldValue);
        });
    });
    this.textfields.forEach(($textField, index) => {
        $textField.keydown((event) => {
            // Allow: backspace, delete, tab, escape, enter and .
            if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
                // Allow: Ctrl/cmd+A
                (event.keyCode == 65 && (event.ctrlKey === true || event.metaKey === true)) ||
                // Allow: Ctrl/cmd+C
                (event.keyCode == 67 && (event.ctrlKey === true || event.metaKey === true)) ||
                // Allow: Ctrl/cmd+X
                (event.keyCode == 88 && (event.ctrlKey === true || event.metaKey === true)) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        });
        $textField.change(() => {
            if (parseInt($textField.val()) > this.max) {
                $textField.val(this.max);
            } else if (parseInt($textField.val()) < this.min) {
                $textField.val(this.min);
            }
            if (!$textField.val()) {
                let targetValue = index === 0 ? this.min : this.max;
                $textField.val(targetValue);
            }
            let newValue;
            if (this.textfields.length > 1) {
                newValue = this.textfields.map($field => {
                    return parseInt($field.val());
                }).sort((a, b) => {
                    return a - b;
                });
            } else {
                newValue = parseInt($textField.val());
            }
            $slider.slider('setValue', newValue, false, true);
        });
    });
}

SliderTextCombo.prototype.addValueGroup = function (groupMembers) {
    let ceilIndex = 0;

    this.$slider.on("change", (event) => {
        let change = event.value.oldValue - event.value.newValue;

        let activeSliders = [];
        let zeroSliders = [];
        groupMembers.forEach(slider => {
            if (this !== slider && slider.isEnabled()) {
                if (slider.getValue() !== 0) {
                    activeSliders.push(slider);
                } else if (change > 0) {
                    zeroSliders.push(slider);
                }
            }
        });
        if (!activeSliders.length) {
            activeSliders = zeroSliders;
        }

        let rest;
        let stillActiveSliders;
        while (change !== 0) {
            ceilIndex = ceilIndex % activeSliders.length;
            rest = 0;
            stillActiveSliders = [];

            let split = Math.round(change / activeSliders.length);
            let ceilExtra = change - split * activeSliders.length;
            activeSliders.forEach((slider, index) => {
                let update = split;
                if (index === ceilIndex) {
                    update += ceilExtra;
                }

                let currentValue = slider.getValue();
                if (update < 0 && currentValue + update < 0) {
                    rest += update + currentValue;
                    update = -currentValue;
                } else {
                    stillActiveSliders.push(slider);
                }

                slider.setValue(currentValue + update);
            });

            change = rest;
            activeSliders = stillActiveSliders;
        }
        ceilIndex++;
    });
};

SliderTextCombo.prototype.getValue = function () {
    return this.$slider.slider('getValue');
};

SliderTextCombo.prototype.setValue = function (newValue, fireChangeEvent) {
    let oldValue = this.$slider.slider('getValue');
    let arrayValue;
    if (Array.isArray(newValue)) {
        arrayValue = newValue;
    } else {
        arrayValue = [newValue];
    }
    this.$slider.slider('setValue', arrayValue, false, fireChangeEvent);
    arrayValue.forEach((value, index) => {
        this.textfields[index].val(value);
    });

    this._listener.forEach(listener => {
        listener(newValue, oldValue);
    });
};

SliderTextCombo.prototype.relayout = function () {
    this.$slider.slider('relayout');
};

SliderTextCombo.prototype.addListener = function (listener) {
    this._listener.push(listener);
};

SliderTextCombo.prototype.setMax = function (newMax) {
    this.max = newMax;
    this.$slider.data('slider').options.max = newMax;
    this.$slider.slider('relayout');
};

SliderTextCombo.prototype.setDisabled = function (disabled) {
    if (disabled) {
        this.setValue(0, true);
        this.$slider.slider('disable');
    } else {
        this.$slider.slider('enable');
    }
    this.textfields.forEach($textField => {
        if (disabled) {
            $textField.addClass('disabled');
        } else {
            $textField.removeClass('disabled');
        }
    });
};

SliderTextCombo.prototype.isEnabled = function () {
    return this.$slider.slider('isEnabled');
};