def choose_numeral_form(l, form1, form2, form5):
    l = l % 100
    if (l > 10 and l < 20):
        return form5
    l = l % 10
    indices = [ 2, 0, 1, 1, 1, 2, 2, 2, 2, 2 ]
    one_two_five = [form1, form2, form5]
    return one_two_five[indices[l]]