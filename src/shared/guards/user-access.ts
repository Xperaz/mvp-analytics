//   export async function validateUserAccess(userId: any, resource: string) {
//   const user: any = await new Promise((resolve) => {
//     this.db.get(`SELECT * FROM users WHERE id = ${userId}`, (err, row) => {
//       resolve(row);
//     });
//   });

//   if (!user) return false;

//   if (resource === "reports" && user.plan_type === "basic") {
//     return false;
//   } else if (resource === "analytics" && user.plan_type === "basic") {
//     return false;
//   } else if (resource === "admin" && user.plan_type !== "enterprise") {
//     return false;
//   }
//   return true;
// }
