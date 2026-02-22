import fs from "fs";
import path from "path";
import process from "process";
import { initializeApp } from "firebase/app";
import {
  Timestamp,
  connectFirestoreEmulator,
  collection,
  getDocs,
  getFirestore,
  writeBatch,
} from "firebase/firestore";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getArgValue = (key) => {
  const prefix = `${key}=`;
  const raw = args.find((a) => a.startsWith(prefix));
  return raw ? raw.slice(prefix.length) : undefined;
};

const envFile = loadEnvFile();
const env = { ...envFile, ...process.env };

const useEmulator =
  hasFlag("--emulator") || env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === "1";
const apply = hasFlag("--apply");
const validate = hasFlag("--validate");
const host = getArgValue("--host") || "127.0.0.1";
const port = Number(getArgValue("--port") || "8080");

const projectId = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "fiap-tc5-2025";

const config = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY || "local",
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "local",
  projectId,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "local",
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID || "local",
};

if (!useEmulator && !hasFlag("--prod")) {
  console.error(
    "Refusing to run against production without --prod. Use --emulator or --prod.",
  );
  process.exit(1);
}

const app = initializeApp(config);
const db = getFirestore(app);

if (useEmulator) {
  connectFirestoreEmulator(db, host, port);
}

function normalizeText(value) {
  if (!value) return "";
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeTimestamp(value) {
  if (!value) return { value: Timestamp.now(), changed: true };

  if (value instanceof Timestamp) {
    return { value, changed: false };
  }

  if (typeof value?.toMillis === "function") {
    const ms = value.toMillis();
    return { value: Timestamp.fromMillis(ms), changed: true };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return { value: Timestamp.fromMillis(value), changed: true };
  }

  if (value instanceof Date) {
    return { value: Timestamp.fromMillis(value.getTime()), changed: true };
  }

  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (Number.isFinite(ms)) {
      return { value: Timestamp.fromMillis(ms), changed: true };
    }
  }

  return { value: Timestamp.now(), changed: true };
}

function ensureStringOrNull(value) {
  return typeof value === "string" && value.trim() ? value : null;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : null;
}

function computeBoardPatch(data) {
  const patch = {};
  let changed = false;

  const title = typeof data?.title === "string" ? data.title : "";
  if (title && !data?.title_lc) {
    patch.title_lc = normalizeText(title);
    changed = true;
  }

  if (!data?.status) {
    patch.status = "active";
    changed = true;
  }

  if (!ensureArray(data?.tagIds)) {
    patch.tagIds = [];
    changed = true;
  }

  if (!ensureArray(data?.tags_lc)) {
    patch.tags_lc = [];
    changed = true;
  }

  if (!ensureArray(data?.members)) {
    const fallback =
      ensureArray(data?.memberIds) || ensureArray(data?.membersIds);
    if (fallback) {
      patch.members = fallback;
      changed = true;
    }
  }

  const pomodoroDefault = {
    enabled: false,
    workSeconds: null,
    restSeconds: null,
    moveOnPauseColumnId: null,
    moveOnResumeColumnId: null,
    moveOnCompleteColumnId: null,
    applyOnColumnId: null,
  };

  if (!data?.pomodoro || typeof data.pomodoro !== "object") {
    patch.pomodoro = pomodoroDefault;
    changed = true;
  } else {
    const src = data.pomodoro;
    const next = { ...pomodoroDefault, ...src };
    next.enabled = !!src.enabled;
    next.workSeconds =
      typeof src.workSeconds === "number" ? Math.trunc(src.workSeconds) : null;
    next.restSeconds =
      typeof src.restSeconds === "number" ? Math.trunc(src.restSeconds) : null;
    next.moveOnPauseColumnId = ensureStringOrNull(src.moveOnPauseColumnId);
    next.moveOnResumeColumnId = ensureStringOrNull(src.moveOnResumeColumnId);
    next.moveOnCompleteColumnId = ensureStringOrNull(src.moveOnCompleteColumnId);
    next.applyOnColumnId = ensureStringOrNull(src.applyOnColumnId);

    const keys = Object.keys(pomodoroDefault);
    for (const key of keys) {
      if (src[key] !== next[key]) {
        patch.pomodoro = next;
        changed = true;
        break;
      }
    }
  }

  const created = normalizeTimestamp(data?.createdAt);
  if (created.changed) {
    patch.createdAt = created.value;
    changed = true;
  }

  const updated = normalizeTimestamp(data?.updatedAt);
  if (updated.changed) {
    patch.updatedAt = updated.value;
    changed = true;
  }

  return changed ? patch : null;
}

function computeUserPatch(data) {
  const patch = {};
  let changed = false;

  const email = typeof data?.email === "string" ? data.email.trim() : "";
  const emailLc = email ? email.toLowerCase() : null;
  if (data?.email_lc !== emailLc) {
    patch.email_lc = emailLc;
    changed = true;
  }

  const created = normalizeTimestamp(data?.createdAt);
  if (created.changed) {
    patch.createdAt = created.value;
    changed = true;
  }

  const updated = normalizeTimestamp(data?.updatedAt);
  if (updated.changed) {
    patch.updatedAt = updated.value;
    changed = true;
  }

  return changed ? patch : null;
}

async function migrateCollection(name, computePatch) {
  const snap = await getDocs(collection(db, name));
  let scanned = 0;
  let updated = 0;
  let batch = writeBatch(db);
  let batchCount = 0;

  const flush = async () => {
    if (!apply || batchCount === 0) return;
    await batch.commit();
    batch = writeBatch(db);
    batchCount = 0;
  };

  for (const docSnap of snap.docs) {
    scanned += 1;
    const patch = computePatch(docSnap.data());
    if (!patch) continue;
    updated += 1;
    if (apply) {
      batch.update(docSnap.ref, patch);
      batchCount += 1;
      if (batchCount >= 400) {
        await flush();
      }
    }
  }

  await flush();
  return { scanned, updated };
}

async function validateCollection(name, computePatch) {
  const snap = await getDocs(collection(db, name));
  let mismatches = 0;
  for (const docSnap of snap.docs) {
    const patch = computePatch(docSnap.data());
    if (patch) mismatches += 1;
  }
  return { total: snap.size, mismatches };
}

async function main() {
  console.log(
    `Firestore migrate: ${useEmulator ? "emulator" : "prod"} ${apply ? "apply" : "dry-run"}`,
  );

  const boards = await migrateCollection("boards", computeBoardPatch);
  const users = await migrateCollection("users", computeUserPatch);

  console.log(
    `boards: scanned=${boards.scanned} updated=${boards.updated}`,
  );
  console.log(`users: scanned=${users.scanned} updated=${users.updated}`);

  if (validate) {
    const boardsCheck = await validateCollection("boards", computeBoardPatch);
    const usersCheck = await validateCollection("users", computeUserPatch);

    console.log(
      `validate boards: total=${boardsCheck.total} mismatches=${boardsCheck.mismatches}`,
    );
    console.log(
      `validate users: total=${usersCheck.total} mismatches=${usersCheck.mismatches}`,
    );

    if (boardsCheck.mismatches || usersCheck.mismatches) {
      process.exitCode = 2;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
