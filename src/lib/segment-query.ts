import { prisma } from "./prisma";

export type SegmentCondition = {
  field: "totalSpend" | "city" | "gender" | "orderCount" | "daysSinceLastPurchase";
  operator: ">" | "<" | "=" | ">=" | "<=" | "contains";
  value: string;
};

export async function queryCustomersByConditions(conditions: SegmentCondition[]) {
  let matchedCustomerIds: string[] | null = null;

  // Process orderCount filter first since it requires relation grouping
  const orderCountCondition = conditions.find((c) => c.field === "orderCount");
  if (orderCountCondition) {
    const val = parseInt(orderCountCondition.value) || 0;
    const op = orderCountCondition.operator;

    if (val === 0 && (op === "=" || op === "<" || op === "<=")) {
      // Find customers with no orders
      const inactiveCustomers = await prisma.customer.findMany({
        where: { orders: { none: {} } },
        select: { id: true },
      });
      matchedCustomerIds = inactiveCustomers.map((c) => c.id);
    } else {
      // Find customers with matching orders count using prisma groupBy
      let havingCondition: any = {};
      if (op === ">") havingCondition = { _count: { gt: val } };
      else if (op === "<") havingCondition = { _count: { lt: val } };
      else if (op === "=") havingCondition = { _count: { equals: val } };
      else if (op === ">=") havingCondition = { _count: { gte: val } };
      else if (op === "<=") havingCondition = { _count: { lte: val } };

      const orderGroups = await prisma.order.groupBy({
        by: ["customerId"],
        _count: { customerId: true },
        having: {
          customerId: havingCondition,
        },
      });

      matchedCustomerIds = orderGroups.map((g) => g.customerId);
    }
  }

  // Build main where clause
  const whereClauses: any[] = [];

  // Restrict to matched IDs from order count filter if applicable
  if (matchedCustomerIds !== null) {
    whereClauses.push({ id: { in: matchedCustomerIds } });
  }

  // Map remaining conditions
  for (const c of conditions) {
    if (c.field === "orderCount") continue; // Already processed

    const val = c.value;
    const op = c.operator;

    if (c.field === "city") {
      if (op === "contains") {
        whereClauses.push({ city: { contains: val, mode: "insensitive" } });
      } else {
        whereClauses.push({ city: { equals: val, mode: "insensitive" } });
      }
    } else if (c.field === "gender") {
      whereClauses.push({ gender: { equals: val, mode: "insensitive" } });
    } else if (c.field === "totalSpend") {
      const numVal = parseFloat(val) || 0;
      if (op === ">") whereClauses.push({ totalSpend: { gt: numVal } });
      else if (op === "<") whereClauses.push({ totalSpend: { lt: numVal } });
      else if (op === "=") whereClauses.push({ totalSpend: { equals: numVal } });
      else if (op === ">=") whereClauses.push({ totalSpend: { gte: numVal } });
      else if (op === "<=") whereClauses.push({ totalSpend: { lte: numVal } });
    } else if (c.field === "daysSinceLastPurchase") {
      const days = parseInt(val) || 0;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - days);

      // daysSinceLastPurchase > X means lastPurchaseDate is older than X days ago (i.e. < targetDate)
      // daysSinceLastPurchase < X means lastPurchaseDate is newer than X days ago (i.e. > targetDate)
      if (op === ">") {
        whereClauses.push({
          OR: [
            { lastPurchaseDate: { lt: targetDate } },
            { lastPurchaseDate: null }, // If never purchased, they are also inactive
          ],
        });
      } else if (op === "<") {
        whereClauses.push({ lastPurchaseDate: { gt: targetDate } });
      } else if (op === "=") {
        // approximate day matches within 24h
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClauses.push({
          lastPurchaseDate: {
            gte: targetDate,
            lt: nextDay,
          },
        });
      } else if (op === ">=") {
        whereClauses.push({
          OR: [
            { lastPurchaseDate: { lte: targetDate } },
            { lastPurchaseDate: null },
          ],
        });
      } else if (op === "<=") {
        whereClauses.push({ lastPurchaseDate: { gte: targetDate } });
      }
    }
  }

  // Execute query
  const customers = await prisma.customer.findMany({
    where: whereClauses.length > 0 ? { AND: whereClauses } : {},
    orderBy: { totalSpend: "desc" },
  });

  return customers;
}
