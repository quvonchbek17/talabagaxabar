export const apiHeaderBearerToken = {
    name: 'Authorization',
    allowEmptyValue: false,
    required: true,
    schema: {
      example: 'Bearer eyJhbGciOiJIUzI1NiJ9.Zjk0ZjA0OGUtYzVlMi00OWMxLWIzNjEtYzkyM2U0NDliNjJk.dWpOUlDAJHHN2L6cTomGrPXOLiES0tLxSvVsHgPnuPY',
    }
}


export const apiParamId = {
    name: 'id',
    allowEmptyValue: false,
    required: true,
    schema: {
      example: '2f2a5e2f-4015-4bd6-9da5-86cf7138f440',
    }
  }