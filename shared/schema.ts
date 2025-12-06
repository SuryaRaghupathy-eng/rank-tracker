import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Saved keywords table for persistent tracking
export const savedKeywords = pgTable("saved_keywords", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  websiteUrl: text("website_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedKeywordsRelations = relations(savedKeywords, ({ many }) => ({
  rankingHistory: many(rankingHistory),
}));

export const insertSavedKeywordSchema = createInsertSchema(savedKeywords).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedKeyword = z.infer<typeof insertSavedKeywordSchema>;
export type SavedKeyword = typeof savedKeywords.$inferSelect;

// Ranking history table for tracking position changes over time
export const rankingHistory = pgTable("ranking_history", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => savedKeywords.id, { onDelete: "cascade" }),
  position: integer("position"),
  title: text("title"),
  snippet: text("snippet"),
  foundUrl: text("found_url"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const rankingHistoryRelations = relations(rankingHistory, ({ one }) => ({
  keyword: one(savedKeywords, {
    fields: [rankingHistory.keywordId],
    references: [savedKeywords.id],
  }),
}));

export const insertRankingHistorySchema = createInsertSchema(rankingHistory).omit({
  id: true,
  checkedAt: true,
});

export type InsertRankingHistory = z.infer<typeof insertRankingHistorySchema>;
export type RankingHistory = typeof rankingHistory.$inferSelect;

// Keyword tracking types - timeFrame uses h (hour), d (day), w (week), m (month) format
export const timeFrameSchema = z.enum(["none", "h", "d", "w", "m"]);
export type TimeFrame = z.infer<typeof timeFrameSchema>;

export const TIME_FRAME_OPTIONS: { value: TimeFrame; label: string }[] = [
  { value: "none", label: "Any Time" },
  { value: "h", label: "Past Hour" },
  { value: "d", label: "Past 24 Hours" },
  { value: "w", label: "Past Week" },
  { value: "m", label: "Past Month" },
];

export const keywordTrackingSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  websiteUrl: z.string().url("Please enter a valid URL"),
  timeFrame: timeFrameSchema.optional().default("none"),
});

export type KeywordTracking = z.infer<typeof keywordTrackingSchema>;

export const rankingResultSchema = z.object({
  keyword: z.string(),
  websiteUrl: z.string(),
  position: z.number().nullable(),
  title: z.string().nullable(),
  snippet: z.string().nullable(),
  foundUrl: z.string().nullable(),
  timeFrame: timeFrameSchema,
  checkedAt: z.string(),
});

export type RankingResult = z.infer<typeof rankingResultSchema>;

export const countryCodeSchema = z.enum([
  "us", "gb", "ca", "au", "de", "fr", "es", "it", "nl", "br", "mx", "jp", "kr", "in", "cn",
  "af", "al", "dz", "as", "ad", "ao", "ai", "aq", "ag", "ar", "am", "aw", "at", "az",
  "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bm", "bt", "bo", "ba", "bw", "bv", "bn", "bg", "bf", "bi",
  "kh", "cm", "cv", "ky", "cf", "td", "cl", "cx", "cc", "co", "km", "cg", "cd", "ck", "cr", "ci", "hr", "cu", "cy", "cz",
  "dk", "dj", "dm", "do", "ec", "eg", "sv", "gq", "er", "ee", "et",
  "fk", "fo", "fj", "fi", "gf", "pf", "tf", "ga", "gm", "ge", "gh", "gi", "gr", "gl", "gd", "gp", "gu", "gt", "gn", "gw", "gy",
  "ht", "hm", "hn", "hk", "hu", "is", "id", "ir", "iq", "ie", "il",
  "jm", "jo", "kz", "ke", "ki", "kp", "kw", "kg", "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu",
  "mo", "mk", "mg", "mw", "my", "mv", "ml", "mt", "mh", "mq", "mr", "mu", "yt", "fm", "md", "mc", "mn", "ms", "ma", "mz", "mm",
  "na", "nr", "np", "an", "nc", "nz", "ni", "ne", "ng", "nu", "nf", "mp", "no",
  "om", "pk", "pw", "ps", "pa", "pg", "py", "pe", "ph", "pn", "pl", "pt", "pr", "qa",
  "re", "ro", "ru", "rw", "sh", "kn", "lc", "pm", "vc", "ws", "sm", "st", "sa", "sn", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "gs", "lk", "sd", "sr", "sj", "sz", "se", "ch", "sy",
  "tw", "tj", "tz", "th", "tl", "tg", "tk", "to", "tt", "tn", "tr", "tm", "tc", "tv", "ug", "ua", "ae", "uy", "uz",
  "vu", "va", "ve", "vn", "vg", "vi", "wf", "eh", "ye", "zm", "zw"
]);

export type CountryCode = z.infer<typeof countryCodeSchema>;

export const COUNTRY_LIST: { code: CountryCode; name: string }[] = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "nl", name: "Netherlands" },
  { code: "br", name: "Brazil" },
  { code: "mx", name: "Mexico" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "in", name: "India" },
  { code: "cn", name: "China" },
  { code: "af", name: "Afghanistan" },
  { code: "al", name: "Albania" },
  { code: "dz", name: "Algeria" },
  { code: "as", name: "American Samoa" },
  { code: "ad", name: "Andorra" },
  { code: "ao", name: "Angola" },
  { code: "ai", name: "Anguilla" },
  { code: "ag", name: "Antigua and Barbuda" },
  { code: "ar", name: "Argentina" },
  { code: "am", name: "Armenia" },
  { code: "aw", name: "Aruba" },
  { code: "at", name: "Austria" },
  { code: "az", name: "Azerbaijan" },
  { code: "bs", name: "Bahamas" },
  { code: "bh", name: "Bahrain" },
  { code: "bd", name: "Bangladesh" },
  { code: "bb", name: "Barbados" },
  { code: "by", name: "Belarus" },
  { code: "be", name: "Belgium" },
  { code: "bz", name: "Belize" },
  { code: "bj", name: "Benin" },
  { code: "bm", name: "Bermuda" },
  { code: "bt", name: "Bhutan" },
  { code: "bo", name: "Bolivia" },
  { code: "ba", name: "Bosnia and Herzegovina" },
  { code: "bw", name: "Botswana" },
  { code: "bn", name: "Brunei" },
  { code: "bg", name: "Bulgaria" },
  { code: "bf", name: "Burkina Faso" },
  { code: "bi", name: "Burundi" },
  { code: "kh", name: "Cambodia" },
  { code: "cm", name: "Cameroon" },
  { code: "cv", name: "Cape Verde" },
  { code: "ky", name: "Cayman Islands" },
  { code: "cf", name: "Central African Republic" },
  { code: "td", name: "Chad" },
  { code: "cl", name: "Chile" },
  { code: "co", name: "Colombia" },
  { code: "km", name: "Comoros" },
  { code: "cg", name: "Congo" },
  { code: "cd", name: "DR Congo" },
  { code: "ck", name: "Cook Islands" },
  { code: "cr", name: "Costa Rica" },
  { code: "ci", name: "Ivory Coast" },
  { code: "hr", name: "Croatia" },
  { code: "cu", name: "Cuba" },
  { code: "cy", name: "Cyprus" },
  { code: "cz", name: "Czech Republic" },
  { code: "dk", name: "Denmark" },
  { code: "dj", name: "Djibouti" },
  { code: "dm", name: "Dominica" },
  { code: "do", name: "Dominican Republic" },
  { code: "ec", name: "Ecuador" },
  { code: "eg", name: "Egypt" },
  { code: "sv", name: "El Salvador" },
  { code: "gq", name: "Equatorial Guinea" },
  { code: "er", name: "Eritrea" },
  { code: "ee", name: "Estonia" },
  { code: "et", name: "Ethiopia" },
  { code: "fk", name: "Falkland Islands" },
  { code: "fo", name: "Faroe Islands" },
  { code: "fj", name: "Fiji" },
  { code: "fi", name: "Finland" },
  { code: "gf", name: "French Guiana" },
  { code: "pf", name: "French Polynesia" },
  { code: "ga", name: "Gabon" },
  { code: "gm", name: "Gambia" },
  { code: "ge", name: "Georgia" },
  { code: "gh", name: "Ghana" },
  { code: "gi", name: "Gibraltar" },
  { code: "gr", name: "Greece" },
  { code: "gl", name: "Greenland" },
  { code: "gd", name: "Grenada" },
  { code: "gp", name: "Guadeloupe" },
  { code: "gu", name: "Guam" },
  { code: "gt", name: "Guatemala" },
  { code: "gn", name: "Guinea" },
  { code: "gw", name: "Guinea-Bissau" },
  { code: "gy", name: "Guyana" },
  { code: "ht", name: "Haiti" },
  { code: "hn", name: "Honduras" },
  { code: "hk", name: "Hong Kong" },
  { code: "hu", name: "Hungary" },
  { code: "is", name: "Iceland" },
  { code: "id", name: "Indonesia" },
  { code: "ir", name: "Iran" },
  { code: "iq", name: "Iraq" },
  { code: "ie", name: "Ireland" },
  { code: "il", name: "Israel" },
  { code: "jm", name: "Jamaica" },
  { code: "jo", name: "Jordan" },
  { code: "kz", name: "Kazakhstan" },
  { code: "ke", name: "Kenya" },
  { code: "ki", name: "Kiribati" },
  { code: "kp", name: "North Korea" },
  { code: "kw", name: "Kuwait" },
  { code: "kg", name: "Kyrgyzstan" },
  { code: "la", name: "Laos" },
  { code: "lv", name: "Latvia" },
  { code: "lb", name: "Lebanon" },
  { code: "ls", name: "Lesotho" },
  { code: "lr", name: "Liberia" },
  { code: "ly", name: "Libya" },
  { code: "li", name: "Liechtenstein" },
  { code: "lt", name: "Lithuania" },
  { code: "lu", name: "Luxembourg" },
  { code: "mo", name: "Macau" },
  { code: "mk", name: "North Macedonia" },
  { code: "mg", name: "Madagascar" },
  { code: "mw", name: "Malawi" },
  { code: "my", name: "Malaysia" },
  { code: "mv", name: "Maldives" },
  { code: "ml", name: "Mali" },
  { code: "mt", name: "Malta" },
  { code: "mh", name: "Marshall Islands" },
  { code: "mq", name: "Martinique" },
  { code: "mr", name: "Mauritania" },
  { code: "mu", name: "Mauritius" },
  { code: "yt", name: "Mayotte" },
  { code: "fm", name: "Micronesia" },
  { code: "md", name: "Moldova" },
  { code: "mc", name: "Monaco" },
  { code: "mn", name: "Mongolia" },
  { code: "ms", name: "Montserrat" },
  { code: "ma", name: "Morocco" },
  { code: "mz", name: "Mozambique" },
  { code: "mm", name: "Myanmar" },
  { code: "na", name: "Namibia" },
  { code: "nr", name: "Nauru" },
  { code: "np", name: "Nepal" },
  { code: "nc", name: "New Caledonia" },
  { code: "nz", name: "New Zealand" },
  { code: "ni", name: "Nicaragua" },
  { code: "ne", name: "Niger" },
  { code: "ng", name: "Nigeria" },
  { code: "nu", name: "Niue" },
  { code: "nf", name: "Norfolk Island" },
  { code: "mp", name: "Northern Mariana Islands" },
  { code: "no", name: "Norway" },
  { code: "om", name: "Oman" },
  { code: "pk", name: "Pakistan" },
  { code: "pw", name: "Palau" },
  { code: "ps", name: "Palestine" },
  { code: "pa", name: "Panama" },
  { code: "pg", name: "Papua New Guinea" },
  { code: "py", name: "Paraguay" },
  { code: "pe", name: "Peru" },
  { code: "ph", name: "Philippines" },
  { code: "pn", name: "Pitcairn Islands" },
  { code: "pl", name: "Poland" },
  { code: "pt", name: "Portugal" },
  { code: "pr", name: "Puerto Rico" },
  { code: "qa", name: "Qatar" },
  { code: "re", name: "Reunion" },
  { code: "ro", name: "Romania" },
  { code: "ru", name: "Russia" },
  { code: "rw", name: "Rwanda" },
  { code: "sh", name: "Saint Helena" },
  { code: "kn", name: "Saint Kitts and Nevis" },
  { code: "lc", name: "Saint Lucia" },
  { code: "pm", name: "Saint Pierre and Miquelon" },
  { code: "vc", name: "Saint Vincent and the Grenadines" },
  { code: "ws", name: "Samoa" },
  { code: "sm", name: "San Marino" },
  { code: "st", name: "Sao Tome and Principe" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "sn", name: "Senegal" },
  { code: "sc", name: "Seychelles" },
  { code: "sl", name: "Sierra Leone" },
  { code: "sg", name: "Singapore" },
  { code: "sk", name: "Slovakia" },
  { code: "si", name: "Slovenia" },
  { code: "sb", name: "Solomon Islands" },
  { code: "so", name: "Somalia" },
  { code: "za", name: "South Africa" },
  { code: "lk", name: "Sri Lanka" },
  { code: "sd", name: "Sudan" },
  { code: "sr", name: "Suriname" },
  { code: "sz", name: "Eswatini" },
  { code: "se", name: "Sweden" },
  { code: "ch", name: "Switzerland" },
  { code: "sy", name: "Syria" },
  { code: "tw", name: "Taiwan" },
  { code: "tj", name: "Tajikistan" },
  { code: "tz", name: "Tanzania" },
  { code: "th", name: "Thailand" },
  { code: "tl", name: "Timor-Leste" },
  { code: "tg", name: "Togo" },
  { code: "tk", name: "Tokelau" },
  { code: "to", name: "Tonga" },
  { code: "tt", name: "Trinidad and Tobago" },
  { code: "tn", name: "Tunisia" },
  { code: "tr", name: "Turkey" },
  { code: "tm", name: "Turkmenistan" },
  { code: "tc", name: "Turks and Caicos Islands" },
  { code: "tv", name: "Tuvalu" },
  { code: "ug", name: "Uganda" },
  { code: "ua", name: "Ukraine" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "uy", name: "Uruguay" },
  { code: "uz", name: "Uzbekistan" },
  { code: "vu", name: "Vanuatu" },
  { code: "va", name: "Vatican City" },
  { code: "ve", name: "Venezuela" },
  { code: "vn", name: "Vietnam" },
  { code: "vg", name: "British Virgin Islands" },
  { code: "vi", name: "U.S. Virgin Islands" },
  { code: "wf", name: "Wallis and Futuna" },
  { code: "eh", name: "Western Sahara" },
  { code: "ye", name: "Yemen" },
  { code: "zm", name: "Zambia" },
  { code: "zw", name: "Zimbabwe" },
];

export const batchKeywordSchema = z.object({
  keywords: z.string().min(1, "At least one keyword is required"),
  websiteUrl: z.string().url("Please enter a valid URL"),
  country: countryCodeSchema.optional().default("us"),
  timeFrame: timeFrameSchema.optional().default("none"),
});

export type BatchKeywordInput = z.infer<typeof batchKeywordSchema>;

// Serper API response types
export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

export interface SerperSearchResponse {
  searchParameters: {
    q: string;
    type: string;
    tbs?: string;
    engine: string;
  };
  organic: SerperOrganicResult[];
  credits: number;
}
