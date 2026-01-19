export const isValidRut = (rut) => {
  if (!rut) return false;

  const cleanRut = rut.replace(/\./g, '').replace('-', '');
  const body = cleanRut.slice(0, -1);
  let dv = cleanRut.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += multiplier * parseInt(body[i], 10);
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculatedDv = 11 - remainder;

  let expectedDv;
  if (calculatedDv === 11) expectedDv = '0';
  else if (calculatedDv === 10) expectedDv = 'K';
  else expectedDv = calculatedDv.toString();

  return dv === expectedDv;
};
