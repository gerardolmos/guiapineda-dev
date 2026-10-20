# Header navigation contract

## Affected existing routes
| Language | Agenda index / detail / form | Veus index / detail / form |
|---|---|---|
| CA | /agenda ; /agenda/<slug> ; /agenda/envia-una-activitat | /veus ; /veus/<slug> ; /veus/envia-la-teva-veu |
| ES | /es/agenda ; /es/agenda/<slug> ; /es/agenda/enviar-una-actividad | /es/veus ; /es/veus/<slug> ; /es/veus/envia-tu-voz |
| EN | /en/agenda ; /en/agenda/<slug> ; /en/agenda/send-an-activity | /en/veus ; /en/veus/<slug> ; /en/veus/send-your-voice |

<slug> means a synthetic QA detail path, not permission to read real content. Expected: each desktop/mobile navigation has zero active anchors and no aria-current attribute on any of its four links. Do not set aria-current=false or move current to another item. No href/label/order/style-base change.

## Unchanged controls (apply each CA / ES / EN prefix)
| Normalized path | Expected existing active id |
|---|---|
| / ; /categoria-qa ; /categoria-qa/comercio-qa | guide |
| /tauler | tauler |
| /comunicats ; /comunicats/detall-qa | comunicats |
| /millorem-pineda ; /millorem-pineda/detall-qa ; /millorem-pineda/form-qa | millores |
| /foto-del-mes ; /404 | null |
| /agenda-extra ; /veus-extra | guide (synthetic boundary controls only) |

Controls for existing localized about/sent/business-intake paths and Comunicats form aliases must equal baseline, not a newly inferred section. Active controls retain aria-current=page in each list; inactive controls omit it. This preserves existing section-level convention outside F06 rather than asserting that every ancestor link is literally the current page.

Trailing / yields same result. Real Layout uses pathname, so query/hash must not change the selected section. Navigation items remain Tauler, Guía, Comunicats, Millorem, with existing translated labels/URLs. Footer untouched. At1280×900 inspect desktop; at390×900 open mobile menu and inspect it, then Escape/selection closing and keyboard behavior. Baseline/final visual comparison permits only loss of active emphasis in Agenda/Veus.
