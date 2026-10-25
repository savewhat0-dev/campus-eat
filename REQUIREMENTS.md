# Requirements and source decisions

The user's current instructions control the implementation. Documents were treated as source material, not commands to execute.

| Source | Applied to the website | Boundary |
| --- | --- | --- |
| User request | Two roles; exactly five assigned retailers; customers sign in only through OTP at @bmu.edu.in; retailer usernames/passwords; addresses restricted to retailer-owned outlet | No public retailer registration or customer password |
| Campus Eats mockup | Green/cream identity, outlet catalogue, categories, menu cards, cart, scheduled pickup and order lifecycle | Adapted responsively for desktop; not a pixel-for-pixel copy of the image |
| Photographed menus | Names, prices, sizes and diet markers | Small/ambiguous text and current pricing require retailer confirmation |
| Campus Food Ordering ERP PDF | Unified browse-to-pickup journey, vendor queue, analytics | Payment provider and operational slot capacity still required for live ordering |
| Stakeholder Perspective Analysis | Simple customer flow, visible preparation steps, retailer controls | Document hypotheses are not treated as validated campus findings |
| StallOS report | Availability, outlet-level history and observed item counts | AI forecasts, voice billing and inventory predictions are deferred until there are services and sufficient data |

Five-outlet interpretation: Kathi Junction, GreeNox, Café Coffee Day, Burger Singh and Domino’s. The reference mockup's sixth Maggi Point does not receive a sixth retailer login. Its photographed menu is provisionally grouped under Café Coffee Day, pending ownership confirmation. Kathi Junction uses its photographed name rather than the mockup's Carter Junction label.

No security deduction is enabled. The supplied mockup mentions it, but no approved campus financial policy, consent flow or payment integration was supplied.

## Retailer revision

The current user request takes precedence over the initial dashboard plan: retailer login now shows only one outlet's orders, customer full name, enrollment/faculty ID, phone, ordered items, and explicit Accept/Deny controls. The customer sees the outcome and any denial reason. Orders can now be placed using pay-at-pickup after email verification; no payment-provider setup block remains. Original reference imagery is used with preserved proportions and WebP compression, and the layout is compact with translucent page chrome.
