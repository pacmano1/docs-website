---
title: User Management
description: Users, roles, and authentication
---

# User Management

OIE maintains its own user accounts for anyone who needs to log in, whether through either administrator, the Command Line Interface, or the REST API. The Users view lets you create, edit, and remove these accounts. Role-based access control is available as a [community extension](./extension_catalog.md#role-based-access-control) for restricting specific operations to designated user roles.

A password, including the admin account's, is reset from the [Command Line Interface](./command_line_interface.md) with `user changepw`.

## Default account

Every new OIE installation ships with a single administrator account:

| Field | Value |
|---|---|
| **Username** | `admin` |
| **Password** | `admin` |

::: warning
Change the default password immediately on your first login. OIE displays a welcome dialog on first login that gives you the option to change it.
:::

## Users view

Open the Users view by clicking **Users** in the main navigation panel. The table displays all user accounts on the server.

### Users table columns

| Column | Description |
|---|---|
| **Username** | The login name (must be unique) |
| **First Name** | The user's given name |
| **Last Name** | The user's family name |
| **Email** | The user's email address. This is the address used when an alert sends notifications to this user. |
| **Country** | Country of residence |
| **State/Territory** | State or territory (for users in the United States) |
| **Phone Number** | Contact phone number |
| **Organization** | The user's organization or company |
| **Role** | Their role within the organization (e.g. Employee - Engineer, Independent Contractor) |
| **Business** | The industry or field they work in (e.g. HIE, Hospital, Lab) |
| **Last Login** | Date and time of the most recent successful login |
| **Description** | An optional free-text description or notes field |

## Managing user accounts

### Creating a new user

1. Click **New User** in the task panel
2. Fill in the required fields (marked with a red asterisk):
   - **Username**
   - **New Password**
   - **Confirm New Password**
3. Optionally fill in the remaining profile fields: First Name, Last Name, Email, Country, State/Territory, Phone, Organization, Role, Business, Description
4. Click **Finish**

::: info
Both password fields must match exactly. The username must not already exist in the system.
:::

### Editing a user

1. Select the user in the table
2. Click **Edit User** in the task panel (or double-click the user row)
3. Modify any fields as needed. The Username field is editable, but the new name must be unique
4. Click **Finish**

### Deleting a user

1. Select the user in the table
2. Click **Delete User** in the task panel
3. Confirm the deletion when prompted

### User tasks summary

| Task | Description |
|---|---|
| **Refresh** | Reload the users table |
| **New User** | Open the new user dialog |
| **Edit User** | Open the selected user for editing |
| **Delete User** | Remove the selected user from the server |

## Password policy

Password requirements are controlled through properties in `conf/mirth.properties`. By default all constraints are disabled (set to `0`), meaning any password is accepted.

| Property | Description | Default |
|---|---|---|
| `password.minlength` | Minimum number of characters | `0` |
| `password.minupper` | Minimum uppercase letters | `0` |
| `password.minlower` | Minimum lowercase letters | `0` |
| `password.minnumeric` | Minimum digit characters | `0` |
| `password.minspecial` | Minimum special characters | `0` |
| `password.retrylimit` | Failed login attempts before the account is locked | `0` (no limit) |
| `password.lockoutperiod` | Hours to keep the account locked (0 = locked until an admin unlocks it) | `0` |
| `password.expiration` | Days until the password expires (0 = never) | `0` |
| `password.graceperiod` | Days of grace after expiration during which the user can still log in | `0` |
| `password.reuseperiod` | Days that must pass before a previous password can be reused | `0` |
| `password.reuselimit` | Number of recent passwords that cannot be reused | `0` |

### Recommended production settings

```properties
password.minlength = 8
password.minupper = 1
password.minlower = 1
password.minnumeric = 1
password.minspecial = 1
password.retrylimit = 5
password.lockoutperiod = 1
password.expiration = 90
password.reuselimit = 5
```

## First login

When you log in for the first time after a fresh installation, OIE presents a welcome dialog that lets you:

1. Customize your user account information (first name, last name, email, etc.)
2. Optionally change the default admin password

## Username behavior

Usernames are case-insensitive by default: `Admin`, `admin`, and `ADMIN` all refer to the same account. A username can be changed after creation through the Edit User dialog, but the new name must be unique.
