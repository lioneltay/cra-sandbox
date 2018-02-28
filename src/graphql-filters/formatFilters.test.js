const R = require("ramda")

const { formatFilters } = require("./formatFilters.js")

test("formatFilters: Leave single filters alone", () => {
  const filters = {
    z: { gt: 1 },
  }

  const formattedFilters = {
    z: { gt: 1 },
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Nested ANDs in ANDs get flattened (1)", () => {
  const filters = {
    z: { gt: 1 },
    AND: [{ x: { gt: 3 } }, { y: { lt: 8 } }],
  }

  const formattedFilters = {
    AND: [{ z: { gt: 1 } }, { x: { gt: 3 } }, { y: { lt: 8 } }],
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Nested ANDs in ANDs get flattened (2)", () => {
  const filters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      {
        AND: [
          { joinDate: { lt: 3, gt: 7, in: [1, 2, 3, 4, 5] } },
          { joinDate: { gt: 7 } },
          { createdAt: { lt: "2018-2-2" } },
        ],
      },
    ],
  }

  const formattedFilters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      { joinDate: { lt: 3 } },
      { joinDate: { gt: 7 } },
      { joinDate: { in: [1, 2, 3, 4, 5] } },
      { joinDate: { gt: 7 } },
      { createdAt: { lt: "2018-2-2" } },
    ],
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Nested ORs in ORs get flattened", () => {
  const filters = {
    OR: [{ z: { gt: 1 } }, { OR: [{ x: { gt: 3 } }, { y: { lt: 8 } }] }],
  }

  const formattedFilters = {
    OR: [{ z: { gt: 1 } }, { x: { gt: 3 } }, { y: { lt: 8 } }],
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Single ORs in ANDs get flattened (1)", () => {
  const filters = {
    OR: [{ x: { gt: 3 } }],
  }

  const formattedFilters = {
    x: { gt: 3 },
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Single ORs in ANDs get flattened (2)", () => {
  const filters = {
    AND: [
      { z: { gt: 2 } },
      {
        OR: [{ x: { gt: 3 } }],
      },
    ],
  }

  const formattedFilters = {
    AND: [{ z: { gt: 2 } }, { x: { gt: 3 } }],
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: flattens multiple layers", () => {
  const filters = {
    OR: [
      {
        AND: [{ x: { gt: 3 } }],
      },
    ],
  }

  const formattedFilters = {
    x: { gt: 3 },
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Handle multi condition objects", () => {
  const filters = {
    createdAt: { gt: "2028-2-2" },
    joinDate: { lt: 3, gt: 7, in: [1, 2, 3, 4, 5] },
  }

  const formattedFilters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      { joinDate: { lt: 3 } },
      { joinDate: { gt: 7 } },
      { joinDate: { in: [1, 2, 3, 4, 5] } },
    ],
  }

  expect(formatFilters(filters)).toEqual(formattedFilters)
})

test("formatFilters: Complex (1)", () => {
  const filters = {
    createdAt: { gt: "2028-2-2" },
    OR: [
      { number: { gt: 3 } },
      { cost: { gt: 3, lt: 5 } },
      { OR: [{ cost: { gt: 3 } }] },
      {
        id: { in: [2, 5, 8, 9] },
        cost: { gt: 20 },
      },
    ],
  }

  const filtersFormatted = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      {
        OR: [
          { number: { gt: 3 } },
          {
            AND: [{ cost: { gt: 3 } }, { cost: { lt: 5 } }],
          },
          { cost: { gt: 3 } },
          {
            AND: [{ id: { in: [2, 5, 8, 9] } }, { cost: { gt: 20 } }],
          },
        ],
      },
    ],
  }

  expect(formatFilters(filters)).toEqual(filtersFormatted)
})

test("formatFilters: Handles relational filters (1)", () => {
  const filters = {
    users: {
      some: {
        lastName: { regex: "^B.*" },
      },
    },
  }

  const filtersFormatted = {
    users: {
      some: {
        lastName: { regex: "^B.*" },
      },
    },
  }

  expect(formatFilters(filters)).toEqual(filtersFormatted)
})

// test("formatFilters: Handles relational filters (2)", () => {
//   const filters = {
//     users: {
//       some: {
//         lastName: { regex: "^B.*" },
//         firstName: { like: "A%", regex: "^B.*" },
//       },
//     },
//   }

//   const filtersFormatted = {
//     users: {
//       some: {
//         AND: [
//           { lastName: { regex: "^B.*" } },
//           { firstName: { like: "^A%" } },
//           { firstName: { regex: "^B.*" } },
//         ],
//       },
//     },
//   }

//   expect(formatFilters(filters)).toEqual(filtersFormatted)
// })

// test("formatFilters: handles multiple relational filters", () => {
//   const filters = {
//     createdAt: { gt: "2028-2-2" },
//     users: {
//       some: {
//         firstName: { regex: "^A.*", like: "%B" },
//         lastName: { regex: "^B.*" },
//       },
//       all: {
//         firstName: { regex: "^A.*", like: "%B" },
//         lastName: { regex: "^B.*" },
//       },
//     },
//   }

//   const filtersFormatted = {
//     AND: [
//       { createdAt: { gt: "2028-2-2" } },
//       {
//         users: {
//           some: {
//             AND: [
//               { firstName: { regex: "^A.*" } },
//               { firstName: { like: "%B" } },
//               { lastName: { regex: "^B.*" } },
//             ],
//           },
//         },
//       },
//       {
//         users: {
//           all: {
//             AND: [
//               { firstName: { regex: "^A.*" } },
//               { firstName: { like: "%B" } },
//               { lastName: { regex: "^B.*" } },
//             ],
//           },
//         },
//       },
//     ],
//   }

//   expect(formatFilters(filters)).toEqual(filtersFormatted)
// })

// test("formatFilters: complex relational", () => {
//   const filters = {
//     createdAt: { gt: "2028-2-2" },
//     users: {
//       some: {
//         firstName: { regex: "^A.*", like: "%B" },
//         lastName: { regex: "^B.*" },
//       },
//       OR: [
//         {
//           AND: [
//             {
//               all: {
//                 accounts: { gt: 1, lt: 3 },
//               },
//             },
//             {
//               some: {
//                 accounts: { gt: 2 },
//               },
//             },
//           ],
//         },
//         {
//           none: {
//             accounts: { gt: 1, lt: 3 },
//           },
//         },
//       ],
//     },
//   }

//   const filtersFormatted = {
//     AND: [
//       { createdAt: { gt: "2028-2-2" } },
//       {
//         users: {
//           some: {
//             AND: [
//               { firstName: { regex: "^A.*" } },
//               { firstName: { like: "%B" } },
//               { lastName: { regex: "^B.*" } },
//             ],
//           },
//         },
//       },
//       {
//         OR: [
//           {
//             users: {
//               all: {
//                 AND: [
//                   { firstName: { regex: "^A.*" } },
//                   { firstName: { like: "%B" } },
//                   { lastName: { regex: "^B.*" } },
//                 ],
//               },
//             },
//           },
//           {
//             users: {
//               none: {
//                 AND: [
//                   { firstName: { regex: "^A.*" } },
//                   { firstName: { like: "%B" } },
//                   { lastName: { regex: "^B.*" } },
//                 ],
//               },
//             },
//           },
//         ],
//       },
//     ],
//   }

//   expect(formatFilters(filters)).toEqual(filtersFormatted)
// })
