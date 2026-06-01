import { mysqlTable, varchar, text, datetime, boolean, decimal, longtext, int } from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
	id: varchar("id", { length: 36 }).primaryKey(),
	name: text("name").notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: longtext("image"),
	role: varchar("role", { length: 20 }).default("user"), // 'user' or 'admin'
	createdAt: datetime("createdAt").notNull(),
	updatedAt: datetime("updatedAt").notNull(),
});

export const session = mysqlTable("session", {
	id: varchar("id", { length: 36 }).primaryKey(),
	expiresAt: datetime("expiresAt").notNull(),
	token: varchar("token", { length: 255 }).notNull().unique(),
	createdAt: datetime("createdAt").notNull(),
	updatedAt: datetime("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: varchar("userId", { length: 36 })
		.notNull()
		.references(() => user.id),
});

export const account = mysqlTable("account", {
	id: varchar("id", { length: 36 }).primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: varchar("userId", { length: 36 })
		.notNull()
		.references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: datetime("accessTokenExpiresAt"),
	refreshTokenExpiresAt: datetime("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: datetime("createdAt").notNull(),
	updatedAt: datetime("updatedAt").notNull(),
});

export const verification = mysqlTable("verification", {
	id: varchar("id", { length: 36 }).primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: datetime("expiresAt").notNull(),
	createdAt: datetime("createdAt"),
	updatedAt: datetime("updatedAt"),
});

export const services = mysqlTable("services", {
	id: varchar("id", { length: 36 }).primaryKey(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	icon: varchar("icon", { length: 50 }),
	image: longtext("image"),
	category: varchar("category", { length: 100 }),
	stock: int("stock").default(100), // Total available keys/slots
	active: boolean("active").default(true),
});

export const digitalKeys = mysqlTable("digital_keys", {
	id: varchar("id", { length: 36 }).primaryKey(),
	serviceId: varchar("serviceId", { length: 36 })
		.notNull()
		.references(() => services.id, { onDelete: 'cascade' }),
	key: text("key").notNull(),
	createdAt: datetime("createdAt").notNull(),
});

export const orders = mysqlTable("orders", {
	id: varchar("id", { length: 36 }).primaryKey(),
	userId: varchar("userId", { length: 36 })
		.notNull()
		.references(() => user.id),
	serviceId: varchar("serviceId", { length: 36 })
		.references(() => services.id),
	status: varchar("status", { length: 50 }).notNull(), // 'pending', 'completed', 'failed'
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	paymentMethod: varchar("paymentMethod", { length: 50 }).default("eSewa"),
	transactionId: varchar("transactionId", { length: 255 }),
	khaltiPidx: varchar("khaltiPidx", { length: 255 }),
	createdAt: datetime("createdAt").notNull(),
});

export const cartItems = mysqlTable("cart_items", {
	id: varchar("id", { length: 36 }).primaryKey(),
	userId: varchar("userId", { length: 36 })
		.notNull()
		.references(() => user.id),
	serviceId: varchar("serviceId", { length: 36 })
		.notNull()
		.references(() => services.id),
	quantity: int("quantity").default(1).notNull(),
	createdAt: datetime("createdAt").notNull(),
});

export const orderItems = mysqlTable("order_items", {
	id: varchar("id", { length: 36 }).primaryKey(),
	orderId: varchar("orderId", { length: 36 })
		.notNull()
		.references(() => orders.id),
	serviceId: varchar("serviceId", { length: 36 })
		.notNull()
		.references(() => services.id),
	quantity: int("quantity").default(1).notNull(),
	priceAtTime: decimal("priceAtTime", { precision: 10, scale: 2 }).notNull(),
});
